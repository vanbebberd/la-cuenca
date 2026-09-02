import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAccess } from "@/lib/business-access";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  const coupons = await prisma.coupon.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
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
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "P2002")
      return NextResponse.json({ error: "El código ya existe, usa uno diferente" }, { status: 409 });
    return NextResponse.json({ error: String((err as Error)?.message ?? "Error") }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  try {
    const { couponId, active } = await req.json();
    const { count } = await prisma.coupon.updateMany({ where: { id: couponId, businessId: id }, data: { active } });
    if (count === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String((err as Error)?.message ?? "Error") }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requireBusinessAccess(id);
  if (!access.ok) return access.response;
  try {
    const { couponId } = await req.json();
    await prisma.coupon.deleteMany({ where: { id: couponId, businessId: id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String((err as Error)?.message ?? "Error") }, { status: 500 });
  }
}
