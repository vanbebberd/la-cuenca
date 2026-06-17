import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  const role = (s?.user as any)?.role;
  return role === "ADMIN" || role === "BUSINESS_OWNER" ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await params;
  try {
    const body = await req.json();
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(body.title !== undefined    && { title: body.title }),
        ...(body.excerpt !== undefined  && { excerpt: body.excerpt || null }),
        ...(body.image !== undefined    && { image: body.image || null }),
        ...(body.linkUrl !== undefined  && { linkUrl: body.linkUrl || null }),
        ...(body.published !== undefined && { published: !!body.published }),
        ...(body.order !== undefined    && { order: parseInt(body.order) }),
      },
    });
    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? "Error") }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
