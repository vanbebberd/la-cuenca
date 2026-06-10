import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { sessionId, participants, guestName, guestEmail, guestPhone, notes } = body;

  const actSession = await prisma.activitySession.findUnique({
    where: { id: sessionId },
    include: { activity: true },
  });
  if (!actSession) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  if (!actSession.active) return NextResponse.json({ error: "Sesión no disponible" }, { status: 400 });

  const available = actSession.maxParticipants - actSession.booked;
  if (parseInt(participants) > available) {
    return NextResponse.json({ error: `Solo quedan ${available} cupos disponibles` }, { status: 400 });
  }

  const activity = actSession.activity;
  const parts = parseInt(participants);
  const activityPrice = activity.pricePerPerson * parts;
  const platformFee = Math.round(activityPrice * (activity.platformFeePercent / 100));
  const totalPrice = activityPrice + platformFee;

  const booking = await prisma.activityBooking.create({
    data: {
      sessionId,
      userId: (session?.user as any)?.id ?? null,
      participants: parts,
      activityPrice,
      platformFee,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone: guestPhone || null,
      notes: notes || null,
      status: "PENDING",
    },
  });

  const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const preference = new Preference(mp);

  const dateStr = new Date(actSession.date).toLocaleDateString("es-CL", { day: "numeric", month: "long" });
  const pref = await preference.create({
    body: {
      items: [{
        id: booking.id,
        title: `${activity.title} · ${dateStr} ${actSession.startTime}`,
        quantity: 1,
        unit_price: totalPrice,
        currency_id: "CLP",
      }],
      payer: { name: guestName, email: guestEmail },
      external_reference: booking.id,
      notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/activities`,
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/activities/success?booking=${booking.confirmCode}`,
        failure: `${process.env.NEXTAUTH_URL}/activities?cancelled=1`,
        pending: `${process.env.NEXTAUTH_URL}/activities/success?booking=${booking.confirmCode}&pending=1`,
      },
      auto_return: "approved",
    },
  });

  return NextResponse.json({ mpCheckoutUrl: pref.init_point, confirmCode: booking.confirmCode });
}
