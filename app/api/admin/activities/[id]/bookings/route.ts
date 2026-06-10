import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: any) {
  return session?.user && ["ADMIN", "BUSINESS_OWNER"].includes((session.user as any).role);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const bookings = await prisma.activityBooking.findMany({
    where: { session: { activityId: id } },
    include: { session: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await params;
  const { bookingId, status } = await req.json();

  const booking = await prisma.activityBooking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.activityBooking.update({ where: { id: bookingId }, data: { status } });

  if (status === "CANCELLED" || status === "REFUNDED") {
    await prisma.activitySession.update({
      where: { id: booking.sessionId },
      data: { booked: { decrement: booking.participants } },
    });
  }
  return NextResponse.json({ ok: true });
}
