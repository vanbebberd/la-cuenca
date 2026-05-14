import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const business = await prisma.business.findUnique({
    where: { id },
    include: { city: true, category: true, hours: { orderBy: { dayOfWeek: "asc" } } },
  });
  if (!business) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(business);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  // Resolve cityId and categoryId from slugs if provided
  let cityId: string | undefined;
  let categoryId: string | undefined;
  if (body.citySlug) {
    const city = await prisma.city.findUnique({ where: { slug: body.citySlug } });
    if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 });
    cityId = city.id;
  }
  if (body.categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: body.categorySlug } });
    if (!cat) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    categoryId = cat.id;
  }

  const { citySlug, categorySlug, ...data } = body;

  const updated = await prisma.business.update({
    where: { id },
    data: {
      ...data,
      ...(cityId && { cityId }),
      ...(categoryId && { categoryId }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.business.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
