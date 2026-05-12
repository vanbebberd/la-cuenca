import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { levelFromLifetime } from "@/lib/utils";

const schema = z.object({
  businessId: z.string(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const { businessId, amount } = parsed.data;

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business?.pointsEnabled) return NextResponse.json({ error: "Local sin puntos" }, { status: 400 });

  const now = new Date();
  const campaign = await prisma.pointsCampaign.findFirst({
    where: {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
      AND: [
        { OR: [{ categoryId: null }, { categoryId: business.categoryId }] },
        { OR: [{ cityId: null }, { cityId: business.cityId }] },
      ],
    },
    orderBy: { multiplier: "desc" },
  });

  const multiplier = campaign?.multiplier ?? 1;
  const points = Math.floor(amount * business.pointsPerPeso * multiplier);
  if (points <= 0) return NextResponse.json({ points: 0 });

  const [tx, balance] = await prisma.$transaction([
    prisma.pointsTransaction.create({
      data: {
        userId,
        businessId,
        type: "EARN",
        points,
        description: `Compra en ${business.name}`,
      },
    }),
    prisma.pointsBalance.upsert({
      where: { userId },
      update: { balance: { increment: points }, lifetime: { increment: points } },
      create: { userId, balance: points, lifetime: points },
    }),
  ]);

  const newLevel = levelFromLifetime(balance.lifetime);
  if (newLevel !== balance.level) {
    await prisma.pointsBalance.update({ where: { userId }, data: { level: newLevel } });
  }

  return NextResponse.json({ points, multiplier, txId: tx.id });
}
