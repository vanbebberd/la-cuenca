import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  citySlug: z.string(),
  categorySlug: z.string(),
  priceRange: z.enum(["BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"]).optional().nullable(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  menuUrl: z.string().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  pointsEnabled: z.boolean().default(false),
  pointsPerPeso: z.number().default(0.01),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", details: parsed.error }, { status: 400 });

  const { citySlug, categorySlug, ...data } = parsed.data;

  const [city, category] = await Promise.all([
    prisma.city.findUnique({ where: { slug: citySlug } }),
    prisma.category.findUnique({ where: { slug: categorySlug } }),
  ]);

  if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 });
  if (!category) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

  let slug = slugify(data.name);
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const business = await prisma.business.create({
    data: {
      ...data,
      slug,
      cityId: city.id,
      categoryId: category.id,
      priceRange: data.priceRange ?? undefined,
      status: role === "ADMIN" ? "ACTIVE" : "PENDING",
      ownerId: (session.user as { id: string }).id,
    },
  });

  return NextResponse.json(business, { status: 201 });
}
