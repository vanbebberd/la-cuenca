import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  businessId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const { businessId, rating, comment } = parsed.data;

  const review = await prisma.review.upsert({
    where: { businessId_userId: { businessId, userId } },
    update: { rating, comment },
    create: { businessId, userId, rating, comment },
    include: { user: { select: { name: true, image: true } } },
  });

  // Update average rating
  const stats = await prisma.review.aggregate({
    where: { businessId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.business.update({
    where: { id: businessId },
    data: {
      avgRating: stats._avg.rating ?? 0,
      reviewCount: stats._count,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
