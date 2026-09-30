import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(120),
  citySlug: z.string().min(1),
  categorySlug: z.string().min(1),
  shortDesc: z.string().max(200).optional(),
  description: z.string().max(3000).optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().max(200).optional(),
  instagram: z.string().max(100).optional(),
  photos: z.array(z.string().url()).max(6).optional(),
  // Campo honeypot: invisible para personas; si viene lleno es un bot.
  website_hp: z.string().optional(),
});

// Alta pública de negocios ("Suma tu negocio"). Sin sesión: cualquiera puede
// mandar su local, pero queda PENDING — no aparece en el sitio hasta que un
// admin lo revisa y lo activa desde /admin/businesses.
export async function POST(req: NextRequest) {
  const rl = rateLimit(`apply:${clientIp(req)}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiados envíos, intenta más tarde" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos del formulario" }, { status: 400 });
  }
  if (parsed.data.website_hp) {
    // Honeypot activado: respondemos ok para no delatar el filtro, sin crear nada.
    return NextResponse.json({ ok: true });
  }

  const { citySlug, categorySlug, photos, email, ...data } = parsed.data;

  const [city, category] = await Promise.all([
    prisma.city.findUnique({ where: { slug: citySlug } }),
    prisma.category.findUnique({ where: { slug: categorySlug } }),
  ]);
  if (!city) return NextResponse.json({ error: "Ciudad no válida" }, { status: 400 });
  if (!category) return NextResponse.json({ error: "Categoría no válida" }, { status: 400 });

  let slug = slugify(data.name);
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const business = await prisma.business.create({
    data: {
      ...data,
      email: email || null,
      slug,
      cityId: city.id,
      categoryId: category.id,
      status: "PENDING",
      coverImage: photos?.[0] ?? null,
      ...(photos && photos.length > 0 && {
        photos: { create: photos.map((url, i) => ({ url, order: i })) },
      }),
    },
  });

  return NextResponse.json({ ok: true, name: business.name }, { status: 201 });
}
