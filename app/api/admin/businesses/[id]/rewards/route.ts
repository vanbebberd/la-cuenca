import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const rewards = await prisma.reward.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const { title, description, pointsCost } = await req.json();
  if (!title || !pointsCost)
    return NextResponse.json({ error: "Título y costo en puntos son obligatorios" }, { status: 400 });
  const reward = await prisma.reward.create({
    data: { businessId: id, title, description: description || null, pointsCost: Number(pointsCost) },
  });
  return NextResponse.json(reward);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const { rewardId } = await req.json();
  await prisma.reward.deleteMany({ where: { id: rewardId, businessId: id } });
  return NextResponse.json({ ok: true });
}
