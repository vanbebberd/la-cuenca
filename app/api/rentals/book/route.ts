import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";

const schema = z.object({
  propertySlug: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int().min(1),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { propertySlug, checkIn: checkInStr, checkOut: checkOutStr, guests, guestName, guestEmail, guestPhone, notes } = parsed.data;

  const property = await prisma.property.findUnique({
    where: { slug: propertySlug, status: "ACTIVE" },
  });
  if (!property) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  if (guests > property.maxGuests) return NextResponse.json({ error: `Máximo ${property.maxGuests} huéspedes` }, { status: 400 });

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  if (checkIn >= checkOut) return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });

  // Check availability
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const datesToBook: Date[] = [];
  const current = new Date(checkIn);
  while (current < checkOut) {
    datesToBook.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const conflicts = await prisma.propertyBlockedDate.count({
    where: { propertyId: property.id, date: { in: datesToBook } },
  });
  if (conflicts > 0) return NextResponse.json({ error: "Fechas no disponibles" }, { status: 409 });

  const overlapping = await prisma.propertyBooking.count({
    where: {
      propertyId: property.id,
      status: { in: ["CONFIRMED", "PENDING"] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  if (overlapping > 0) return NextResponse.json({ error: "Fechas no disponibles" }, { status: 409 });

  // Calculate prices
  const nightsPrice = property.pricePerNight * nights;
  const cleaningFee = property.cleaningFee;
  const platformFee = Math.round((nightsPrice + cleaningFee) * (property.platformFeePercent / 100));
  const totalPrice = nightsPrice + cleaningFee + platformFee;

  const userId = session?.user ? (session.user as { id: string }).id : undefined;

  // Create pending booking
  const booking = await prisma.propertyBooking.create({
    data: {
      propertyId: property.id,
      userId,
      checkIn,
      checkOut,
      guests,
      nights,
      nightsPrice,
      cleaningFee,
      platformFee,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      status: "PENDING",
    },
  });

  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const preference = new Preference(mpClient);
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const pref = await preference.create({
    body: {
      items: [
        {
          id: booking.id,
          title: `${property.title} — ${nights} noche${nights > 1 ? "s" : ""}`,
          quantity: 1,
          unit_price: totalPrice,
          currency_id: "CLP",
        },
      ],
      payer: { name: guestName, email: guestEmail },
      back_urls: {
        success: `${baseUrl}/rentals/success?booking=${booking.confirmCode}`,
        failure: `${baseUrl}/rentals/${propertySlug}?error=pago`,
        pending: `${baseUrl}/rentals/success?booking=${booking.confirmCode}&pending=1`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/rentals`,
      metadata: { bookingId: booking.id, propertyId: property.id },
    },
  });

  return NextResponse.json({ mpCheckoutUrl: pref.init_point, bookingId: booking.id });
}
