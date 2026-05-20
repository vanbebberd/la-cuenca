import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const campaigns = await prisma.pointsCampaign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { name, description, multiplier, startDate, endDate, active } = await req.json();
  if (!name || !startDate || !endDate)
    return NextResponse.json({ error: "Nombre, fecha inicio y fin son obligatorios" }, { status: 400 });
  const campaign = await prisma.pointsCampaign.create({
    data: {
      name,
      description: description || null,
      multiplier: Number(multiplier) || 1,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      active: active ?? true,
    },
  });
  return NextResponse.json(campaign);
}
