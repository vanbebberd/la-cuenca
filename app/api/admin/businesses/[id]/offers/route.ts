import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  badge: z.string().optional(),
  validTo: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdmin(session: any) {
  const role = session?.user?.role as string | undefined;
  return !!session && (role === "ADMIN" || role === "BUSINESS_OWNER");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offers = await prisma.offer.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(offers);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
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

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { offerId, active } = await req.json();
  const offer = await prisma.offer.update({ where: { id: offerId }, data: { active } });
  return NextResponse.json(offer);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { offerId } = await req.json();
  await prisma.offer.delete({ where: { id: offerId } });
  return NextResponse.json({ ok: true });
}
