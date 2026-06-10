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
  try {
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

    const data: Record<string, any> = {};

    if (body.title !== undefined)            data.title            = body.title;
    if (body.category !== undefined)         data.category         = body.category;
    if (body.status !== undefined)           data.status           = body.status;
    if (body.duration !== undefined)         data.duration         = body.duration;
    if (body.shortDesc !== undefined)        data.shortDesc        = body.shortDesc || null;
    if (body.description !== undefined)      data.description      = body.description || null;
    if (body.meetingPoint !== undefined)     data.meetingPoint     = body.meetingPoint || null;
    if (body.requirements !== undefined)     data.requirements     = body.requirements || null;
    if (body.includes !== undefined)         data.includes         = body.includes;

    if (body.difficulty !== undefined)       data.difficulty       = body.difficulty || null;
    if (body.featured !== undefined)         data.featured         = body.featured === "on" || body.featured === true;
    if (body.pricePerPerson !== undefined)   data.pricePerPerson   = parseFloat(body.pricePerPerson);
    if (body.minParticipants !== undefined)  data.minParticipants  = parseInt(body.minParticipants);
    if (body.maxParticipants !== undefined)  data.maxParticipants  = parseInt(body.maxParticipants);
    if (body.platformFeePercent !== undefined) data.platformFeePercent = parseFloat(body.platformFeePercent);
    if (body.lat !== undefined)              data.lat              = body.lat ? parseFloat(body.lat) : null;
    if (body.lng !== undefined)              data.lng              = body.lng ? parseFloat(body.lng) : null;

    if (cityId) data.cityId = cityId;

    const activity = await prisma.activity.update({ where: { id }, data });
    return NextResponse.json(activity);
  } catch (e: any) {
    console.error("PATCH /api/admin/activities/[id]:", e);
    return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
