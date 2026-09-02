import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totals, daily] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["type"],
      where: { businessId: id, createdAt: { gte: since } },
      _count: { type: true },
    }),
    prisma.$queryRaw<{ day: string; type: string; count: bigint }[]>`
      SELECT
        DATE("createdAt") as day,
        type,
        COUNT(*) as count
      FROM "AnalyticsEvent"
      WHERE "businessId" = ${id}
        AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt"), type
      ORDER BY day ASC
    `,
  ]);

  return NextResponse.json({
    totals: Object.fromEntries(totals.map((t) => [t.type, t._count.type])),
    daily: daily.map((d) => ({ ...d, count: Number(d.count) })),
  });
}
