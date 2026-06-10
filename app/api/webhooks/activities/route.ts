import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.type !== "payment") return NextResponse.json({ ok: true });

    const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
    const payment = new Payment(mp);
    const data = await payment.get({ id: body.data?.id });

    const bookingId = data.external_reference;
    if (!bookingId) return NextResponse.json({ ok: true });

    const booking = await prisma.activityBooking.findUnique({ where: { id: bookingId } });
    if (!booking) return NextResponse.json({ ok: true });

    if (data.status === "approved") {
      await prisma.activityBooking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED", mpPaymentId: String(data.id) },
      });
      await prisma.activitySession.update({
        where: { id: booking.sessionId },
        data: { booked: { increment: booking.participants } },
      });
    } else if (data.status === "rejected" || data.status === "cancelled") {
      await prisma.activityBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", mpPaymentId: String(data.id) },
      });
    }
  } catch {
    // swallow errors so MP doesn't retry
  }
  return NextResponse.json({ ok: true });
}
