import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  businessId: z.string(),
  date: z.string(),
  time: z.string(),
  partySize: z.number().int().min(1).max(20),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const { businessId, date, time, partySize, notes } = parsed.data;

  const reservation = await prisma.reservation.create({
    data: {
      businessId,
      userId,
      date: new Date(date),
      time,
      partySize,
      notes,
    },
  });

  return NextResponse.json(reservation, { status: 201 });
}
