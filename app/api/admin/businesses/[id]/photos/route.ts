import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const photos = await prisma.businessPhoto.findMany({
    where: { businessId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const { url, alt } = await req.json();
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 });

  const count = await prisma.businessPhoto.count({ where: { businessId: id } });
  const photo = await prisma.businessPhoto.create({
    data: { businessId: id, url, alt: alt ?? null, order: count },
  });
  return NextResponse.json(photo, { status: 201 });
}
