import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blocked = await prisma.propertyBlockedDate.findMany({ where: { propertyId: id } });
  return NextResponse.json(blocked.map((b) => b.date.toISOString().slice(0, 10)));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const { dates, reason } = await req.json();

  await prisma.propertyBlockedDate.createMany({
    data: (dates as string[]).map((d) => ({ propertyId: id, date: new Date(d), reason })),
    skipDuplicates: true,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const { dates } = await req.json();
  await prisma.propertyBlockedDate.deleteMany({
    where: { propertyId: id, date: { in: (dates as string[]).map((d) => new Date(d)) } },
  });
  return NextResponse.json({ ok: true });
}
