import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;

  const business = await prisma.business.findUnique({
    where: { id },
    include: { city: true, category: true, hours: { orderBy: { dayOfWeek: "asc" } } },
  });
  if (!business) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(business);
}

const str = z.string().optional().nullable();

// Campos que el dueño de un local puede editar.
const ownerFields = z.object({
  name: z.string().min(2).optional(),
  shortDesc: str,
  description: str,
  citySlug: z.string().optional(),
  categorySlug: z.string().optional(),
  priceRange: z.enum(["BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"]).nullable().optional(),
  address: str,
  phone: str,
  whatsapp: str,
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  website: str,
  instagram: str,
  facebook: str,
  menuUrl: str,
  bookingUrl: str,
  coverImage: str,
  logo: str,
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  pointsEnabled: z.boolean().optional(),
  pointsPerPeso: z.number().min(0).max(1).optional(),
});

// Campos reservados a ADMIN (moderación / plan / visibilidad).
const adminFields = ownerFields.extend({
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).optional(),
  verified: z.boolean().optional(),
  featured: z.boolean().optional(),
  plan: z.enum(["FREE", "BASIC", "PRO"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;

  const schema = access.role === "ADMIN" ? adminFields : ownerFields;
  // z.object() descarta claves desconocidas por defecto: un BUSINESS_OWNER
  // que mande `status`/`plan`/`ownerId` simplemente los pierde, no error.
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.issues }, { status: 400 });
  }
  const { citySlug, categorySlug, email, priceRange, ...rest } = parsed.data;

  let cityId: string | undefined;
  let categoryId: string | undefined;
  if (citySlug) {
    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 });
    cityId = city.id;
  }
  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!cat) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    categoryId = cat.id;
  }

  const updated = await prisma.business.update({
    where: { id },
    data: {
      ...rest,
      ...(email !== undefined && { email: email || null }),
      ...(priceRange !== undefined && { priceRange: priceRange ?? null }),
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
