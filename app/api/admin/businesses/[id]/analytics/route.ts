import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER"))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
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
