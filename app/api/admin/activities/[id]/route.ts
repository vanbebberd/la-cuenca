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
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { city: true, photos: { orderBy: { order: "asc" } } },
  });
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(activity);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  let cityId: string | undefined;
  if (body.citySlug) {
    const city = await prisma.city.findUnique({ where: { slug: body.citySlug } });
    if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 400 });
    cityId = city.id;
  }

  const data: any = { ...body };
  if (cityId) data.cityId = cityId;
  delete data.citySlug;
  if (data.pricePerPerson) data.pricePerPerson = parseFloat(data.pricePerPerson);
  if (data.minParticipants) data.minParticipants = parseInt(data.minParticipants);
  if (data.maxParticipants) data.maxParticipants = parseInt(data.maxParticipants);
  if (data.platformFeePercent) data.platformFeePercent = parseFloat(data.platformFeePercent);
  if (data.lat) data.lat = parseFloat(data.lat);
  if (data.lng) data.lng = parseFloat(data.lng);
  if (data.difficulty === "") data.difficulty = null;

  const activity = await prisma.activity.update({ where: { id }, data });
  return NextResponse.json(activity);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
