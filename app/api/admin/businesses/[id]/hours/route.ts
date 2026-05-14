import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const { hours } = await req.json();

  await prisma.$transaction([
    prisma.businessHours.deleteMany({ where: { businessId: id } }),
    prisma.businessHours.createMany({
      data: hours.map((h: { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }) => ({
        businessId: id,
        dayOfWeek: h.dayOfWeek,
        openTime: h.closed ? null : (h.openTime || null),
        closeTime: h.closed ? null : (h.closeTime || null),
        closed: h.closed,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
