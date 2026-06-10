import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  businessId: z.string(),
  type: z.enum(["VIEW", "WHATSAPP_CLICK", "CALL_CLICK", "DIRECTIONS_CLICK", "RESERVATION"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.analyticsEvent.create({ data: parsed.data });
  return NextResponse.json({ ok: true });
}
