import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return !!session && (role === "ADMIN" || role === "BUSINESS_OWNER");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sections, products] = await Promise.all([
    prisma.productSection.findMany({ where: { businessId: id }, orderBy: { order: "asc" } }),
    prisma.product.findMany({ where: { businessId: id }, orderBy: [{ sectionId: "asc" }, { order: "asc" }] }),
  ]);
  return NextResponse.json({ sections, products });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  // Create a section
  if (body.type === "section") {
    const parsed = sectionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    const section = await prisma.productSection.create({
      data: { businessId: id, name: parsed.data.sectionName, order: parsed.data.sectionOrder ?? 0 },
    });
    return NextResponse.json(section);
  }

  // Create a product
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const product = await prisma.product.create({
    data: { businessId: id, ...parsed.data },
  });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await params;
  const { productId, sectionId, ...data } = await req.json();

  if (sectionId && !productId) {
    const section = await prisma.productSection.update({ where: { id: sectionId }, data });
    return NextResponse.json(section);
  }
  const product = await prisma.product.update({ where: { id: productId }, data });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await params;
  const { productId, sectionId } = await req.json();

  if (sectionId) {
    await prisma.productSection.delete({ where: { id: sectionId } });
  } else {
    await prisma.product.delete({ where: { id: productId } });
  }
  return NextResponse.json({ ok: true });
}
