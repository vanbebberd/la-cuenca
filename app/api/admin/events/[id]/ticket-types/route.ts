import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER"))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const { name, description, price, capacity } = await req.json();
  const tt = await prisma.ticketType.create({
    data: { eventId: id, name, description: description || null, price: Number(price), capacity: Number(capacity) },
  });
  return NextResponse.json(tt);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER"))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { ticketTypeId } = await req.json();
  await prisma.ticketType.delete({ where: { id: ticketTypeId } });
  return NextResponse.json({ ok: true });
}
