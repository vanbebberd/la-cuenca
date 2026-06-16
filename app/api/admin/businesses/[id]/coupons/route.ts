import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function auth() {
  return getServerSession(authOptions).then((s) => (s?.user as any)?.role as string | undefined);
}

export async function GET(_req: NextRequest, { params }: Params) {
  const role = await auth();
  if (role !== "ADMIN" && role !== "BUSINESS_OWNER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const coupons = await prisma.coupon.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest, { params }: Params) {
  const role = await auth();
  if (role !== "ADMIN" && role !== "BUSINESS_OWNER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const { code, title, description, discountType, discountValue, minPurchase, maxUses, validFrom, validTo } = body;
    if (!code || !title || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    const coupon = await prisma.coupon.create({
      data: {
        businessId: id,
        code: String(code).toUpperCase().trim(),
        title,
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "El código ya existe, usa uno diferente" }, { status: 409 });
    return NextResponse.json({ error: String(err?.message ?? "Error") }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const role = await auth();
  if (role !== "ADMIN" && role !== "BUSINESS_OWNER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await params;
  try {
    const { couponId, active } = await req.json();
    const coupon = await prisma.coupon.update({ where: { id: couponId }, data: { active } });
    return NextResponse.json(coupon);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? "Error") }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = await auth();
  if (role !== "ADMIN" && role !== "BUSINESS_OWNER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await params;
  try {
    const { couponId } = await req.json();
    await prisma.coupon.delete({ where: { id: couponId } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? "Error") }, { status: 500 });
  }
}
