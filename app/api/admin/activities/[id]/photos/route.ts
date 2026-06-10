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
  const photos = await prisma.activityPhoto.findMany({
    where: { activityId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(photos);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { url, alt } = await req.json();

  const count = await prisma.activityPhoto.count({ where: { activityId: id } });
  const photo = await prisma.activityPhoto.create({
    data: { activityId: id, url, alt: alt || null, order: count },
  });

  if (count === 0) {
    await prisma.activity.update({ where: { id }, data: { coverImage: url } });
  }
  return NextResponse.json(photo, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { photoId } = await req.json();

  await prisma.activityPhoto.delete({ where: { id: photoId } });

  const first = await prisma.activityPhoto.findFirst({ where: { activityId: id }, orderBy: { order: "asc" } });
  await prisma.activity.update({ where: { id }, data: { coverImage: first?.url ?? null } });
  return NextResponse.json({ ok: true });
}
