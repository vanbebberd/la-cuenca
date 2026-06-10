import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const bookings = await prisma.propertyBooking.findMany({
    where: { propertyId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { bookingId, status } = await req.json();

  const booking = await prisma.propertyBooking.update({
    where: { id: bookingId },
    data: { status },
  });

  // If cancelled, unblock the dates
  if (status === "CANCELLED") {
    const dates: Date[] = [];
    const current = new Date(booking.checkIn);
    while (current < booking.checkOut) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    await prisma.propertyBlockedDate.deleteMany({
      where: { propertyId: booking.propertyId, date: { in: dates } },
    });
  }

  return NextResponse.json(booking);
}
