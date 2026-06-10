import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function isAdmin(session: any) {
  return session?.user && ["ADMIN", "BUSINESS_OWNER"].includes((session.user as any).role);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activities = await prisma.activity.findMany({
    include: { city: true, photos: { take: 1, orderBy: { order: "asc" } }, _count: { select: { sessions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, citySlug, category, difficulty, duration, pricePerPerson, minParticipants, maxParticipants,
      platformFeePercent, description, shortDesc, meetingPoint, lat, lng, includes, excludes, requirements } = body;

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 400 });

    let slug = slugify(title);
    let i = 0;
    while (await prisma.activity.findUnique({ where: { slug } })) {
      slug = `${slugify(title)}-${++i}`;
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        slug,
        status: "ACTIVE",
        description: description || null,
        shortDesc: shortDesc || null,
        category,
        difficulty: difficulty || null,
        duration,
        pricePerPerson: parseFloat(pricePerPerson),
        minParticipants: parseInt(minParticipants) || 1,
        maxParticipants: parseInt(maxParticipants) || 10,
        platformFeePercent: parseFloat(platformFeePercent) || 10,
        meetingPoint: meetingPoint || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        includes: includes ?? [],
        excludes: excludes ?? [],
        requirements: requirements || null,
        cityId: city.id,
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/admin/activities:", e);
    return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
  }
}
