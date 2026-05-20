import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rewards = await prisma.reward.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER"))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const { title, description, pointsCost } = await req.json();
  if (!title || !pointsCost)
    return NextResponse.json({ error: "Título y costo en puntos son obligatorios" }, { status: 400 });
  const reward = await prisma.reward.create({
    data: { businessId: id, title, description: description || null, pointsCost: Number(pointsCost) },
  });
  return NextResponse.json(reward);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER"))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { rewardId } = await req.json();
  await prisma.reward.delete({ where: { id: rewardId } });
  return NextResponse.json({ ok: true });
}
