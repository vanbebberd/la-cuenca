import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const activity = await prisma.activity.findUnique({ where: { slug } });
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sessions = await prisma.activitySession.findMany({
    where: {
      activityId: activity.id,
      active: true,
      ...(from || to ? {
        date: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      } : { date: { gte: new Date() } }),
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(sessions);
}
