import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  sectionId: z.string().optional(),
  available: z.boolean().optional(),
  order: z.number().optional(),
});

const sectionSchema = z.object({
  sectionName: z.string().min(1),
  sectionOrder: z.number().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const [sections, products] = await Promise.all([
    prisma.productSection.findMany({ where: { businessId: id }, orderBy: { order: "asc" } }),
    prisma.product.findMany({ where: { businessId: id }, orderBy: [{ sectionId: "asc" }, { order: "asc" }] }),
  ]);
  return NextResponse.json({ sections, products });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const body = await req.json();

  if (body.type === "section") {
    const parsed = sectionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    const section = await prisma.productSection.create({
      data: { businessId: id, name: parsed.data.sectionName, order: parsed.data.sectionOrder ?? 0 },
    });
    return NextResponse.json(section);
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const product = await prisma.product.create({
    data: { businessId: id, ...parsed.data },
  });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const { productId, sectionId, ...data } = await req.json();

  if (sectionId && !productId) {
    const { count } = await prisma.productSection.updateMany({ where: { id: sectionId, businessId: id }, data });
    if (count === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  const { count } = await prisma.product.updateMany({ where: { id: productId, businessId: id }, data });
  if (count === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const { productId, sectionId } = await req.json();

  if (sectionId) {
    await prisma.productSection.deleteMany({ where: { id: sectionId, businessId: id } });
  } else {
    await prisma.product.deleteMany({ where: { id: productId, businessId: id } });
  }
  return NextResponse.json({ ok: true });
}
