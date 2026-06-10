import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const property = await prisma.property.findUnique({ where: { slug }, select: { id: true } });
  if (!property) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month + 1, 0); // two months ahead

  const [blocked, bookings] = await Promise.all([
    prisma.propertyBlockedDate.findMany({
      where: { propertyId: property.id, date: { gte: start, lte: end } },
      select: { date: true },
    }),
    prisma.propertyBooking.findMany({
      where: {
        propertyId: property.id,
        status: { in: ["CONFIRMED", "PENDING"] },
        checkOut: { gte: start },
        checkIn: { lte: end },
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  const unavailable = new Set<string>();

  blocked.forEach((b) => unavailable.add(b.date.toISOString().slice(0, 10)));

  bookings.forEach((b) => {
    const current = new Date(b.checkIn);
    while (current < b.checkOut) {
      unavailable.add(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
  });

  return NextResponse.json({ unavailable: Array.from(unavailable) });
}
