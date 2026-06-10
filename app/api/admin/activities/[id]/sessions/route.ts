import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: any) {
  return session?.user && ["ADMIN", "BUSINESS_OWNER"].includes((session.user as any).role);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const sessions = await prisma.activitySession.findMany({
    where: { activityId: id },
    include: { _count: { select: { bookings: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { date, startTime, endTime, maxParticipants } = await req.json();

  const activity = await prisma.activity.findUnique({ where: { id }, select: { maxParticipants: true } });
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const actSession = await prisma.activitySession.create({
    data: {
      activityId: id,
      date: new Date(date),
      startTime,
      endTime: endTime || null,
      maxParticipants: parseInt(maxParticipants) || activity.maxParticipants,
    },
  });
  return NextResponse.json(actSession, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sessionId } = await req.json();

  await prisma.activitySession.delete({ where: { id: sessionId } });
  return NextResponse.json({ ok: true });
}
