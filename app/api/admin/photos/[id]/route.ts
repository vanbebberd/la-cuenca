import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.businessPhoto.findUnique({
    where: { id },
    select: { businessId: true },
  });
  if (!photo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const access = await requireBusinessAccess(photo.businessId);
  if (!access.ok) return access.response;

  await prisma.businessPhoto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
