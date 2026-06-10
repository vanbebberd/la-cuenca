import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { city: true, photos: { orderBy: { order: "asc" } } },
  });
  if (!property) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  if (body.citySlug) {
    const city = await prisma.city.findUnique({ where: { slug: body.citySlug } });
    if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 });
    body.cityId = city.id;
    delete body.citySlug;
  }

  const property = await prisma.property.update({ where: { id }, data: body });
  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
