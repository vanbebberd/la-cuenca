import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photos = await prisma.propertyPhoto.findMany({ where: { propertyId: id }, orderBy: { order: "asc" } });
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const { url, alt } = await req.json();
  const count = await prisma.propertyPhoto.count({ where: { propertyId: id } });
  const photo = await prisma.propertyPhoto.create({ data: { propertyId: id, url, alt, order: count } });
  return NextResponse.json(photo);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { photoId } = await req.json();
  await prisma.propertyPhoto.delete({ where: { id: photoId } });
  return NextResponse.json({ ok: true });
}
