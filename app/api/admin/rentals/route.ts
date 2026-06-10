import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const properties = await prisma.property.findMany({
    include: { city: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { title, citySlug, ...rest } = body;
  if (!title || !citySlug) return NextResponse.json({ error: "Título y ciudad son obligatorios" }, { status: 400 });

  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 });

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const property = await prisma.property.create({
    data: { title, slug, cityId: city.id, ...rest },
  });
  return NextResponse.json(property);
}
