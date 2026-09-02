import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  badge: z.string().optional(),
  validTo: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const offers = await prisma.offer.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(offers);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const offer = await prisma.offer.create({
    data: {
      businessId: id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      badge: parsed.data.badge ?? null,
      validTo: parsed.data.validTo ? new Date(parsed.data.validTo) : null,
    },
  });
  return NextResponse.json(offer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;

  const { offerId, active } = await req.json();
  const { count } = await prisma.offer.updateMany({
    where: { id: offerId, businessId: id },
    data: { active },
  });
  if (count === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;

  const { offerId } = await req.json();
  const { count } = await prisma.offer.deleteMany({ where: { id: offerId, businessId: id } });
  if (count === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
