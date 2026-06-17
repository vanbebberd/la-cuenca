import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  const role = (s?.user as any)?.role;
  return role === "ADMIN" || role === "BUSINESS_OWNER" ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key) {
    const s = await prisma.siteSetting.findUnique({ where: { key } });
    return NextResponse.json({ value: s?.value ?? null });
  }
  const all = await prisma.siteSetting.findMany();
  return NextResponse.json(Object.fromEntries(all.map(s => [s.key, s.value])));
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { key, value } = await req.json();
  const s = await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  return NextResponse.json(s);
}
