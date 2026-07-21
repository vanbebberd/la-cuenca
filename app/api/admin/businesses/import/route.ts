import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  const role = (s?.user as { role?: string })?.role;
  return role === "ADMIN" ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(); if (deny) return deny;

  const { rows } = await req.json() as { rows: Record<string, string>[] };

  const [categories, cities] = await Promise.all([
    prisma.category.findMany(),
    prisma.city.findMany(),
  ]);

  const created: string[] = [];
  const errors: { row: number; name: string; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const name = r.nombre?.trim();
    if (!name) { errors.push({ row: i + 1, name: "-", error: "Nombre vacío" }); continue; }

    const catInput = r.categoria?.trim().toLowerCase();
    const category = categories.find(c =>
      c.slug === catInput ||
      c.name.toLowerCase() === catInput ||
      c.slug.startsWith(catInput) ||
      catInput.startsWith(c.slug)
    );
    if (!category) { errors.push({ row: i + 1, name, error: `Categoría no encontrada: "${r.categoria}". Disponibles: ${categories.map(c => c.slug).join(", ")}` }); continue; }

    const cityInput = r.ciudad?.trim().toLowerCase();
    const city = cities.find(c =>
      c.slug === cityInput ||
      c.name.toLowerCase() === cityInput ||
      c.slug.includes(cityInput) ||
      cityInput.includes(c.slug)
    );
    if (!city) { errors.push({ row: i + 1, name, error: `Ciudad no encontrada: "${r.ciudad}". Disponibles: ${cities.map(c => c.slug).join(", ")}` }); continue; }

    // Generate unique slug
    let slug = slugify(name);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    try {
      await prisma.business.create({
        data: {
          name,
          slug,
          categoryId: category.id,
          cityId: city.id,
          phone:     r.telefono?.trim()       || null,
          whatsapp:  r.whatsapp?.trim()       || null,
          email:     r.email?.trim()          || null,
          website:   r.sitio_web?.trim()      || null,
          instagram: r.instagram?.trim()      || null,
          facebook:  r.facebook?.trim()       || null,
          description: r.descripcion?.trim()  || null,
          shortDesc: r.descripcion_corta?.trim() || null,
          address:   r.direccion?.trim()      || null,
          status:    "ACTIVE",
        },
      });
      created.push(name);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ row: i + 1, name, error: msg });
    }
  }

  return NextResponse.json({ created: created.length, errors });
}
