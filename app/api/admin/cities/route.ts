import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(cities);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { name, lat, lng } = await req.json();
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const slug = slugify(name);
  const existing = await prisma.city.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Ciudad ya existe" }, { status: 409 });

  const city = await prisma.city.create({
    data: { name, slug, lat: lat ?? null, lng: lng ?? null },
  });
  return NextResponse.json(city, { status: 201 });
}
