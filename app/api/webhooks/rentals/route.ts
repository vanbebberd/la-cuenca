import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type !== "payment") return NextResponse.json({ ok: true });

  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const paymentClient = new Payment(mpClient);

  let payment;
  try {
    payment = await paymentClient.get({ id: body.data.id });
  } catch {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const bookingId = payment.metadata?.bookingId as string | undefined;
  if (!bookingId) return NextResponse.json({ ok: true });

  const booking = await prisma.propertyBooking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ ok: true });

  if (payment.status === "approved") {
    // Confirm booking and block dates
    await prisma.propertyBooking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED", mpPaymentId: String(payment.id) },
    });

    const dates: Date[] = [];
    const current = new Date(booking.checkIn);
    while (current < booking.checkOut) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    await prisma.propertyBlockedDate.createMany({
      data: dates.map((d) => ({ propertyId: booking.propertyId, date: d, reason: "BOOKED" })),
      skipDuplicates: true,
    });
  } else if (payment.status === "rejected" || payment.status === "cancelled") {
    await prisma.propertyBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ ok: true });
}
