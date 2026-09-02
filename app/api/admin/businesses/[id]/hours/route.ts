import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;

  const { hours } = await req.json();
  if (!Array.isArray(hours)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

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
