import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  const role = (s?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" || role === "BUSINESS_OWNER" ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await params;
  try {
    const b = await req.json();

    let slugUpdate: Record<string, string | null> = {};
    if (b.slug !== undefined) {
      const s = b.slug ? slugify(b.slug) : null;
      if (s) {
        const clash = await prisma.post.findFirst({ where: { slug: s, NOT: { id } } });
        slugUpdate = { slug: clash ? `${s}-${Date.now().toString(36)}` : s };
      } else {
        slugUpdate = { slug: null };
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(b.title !== undefined     && { title: b.title }),
        ...slugUpdate,
        ...(b.excerpt !== undefined   && { excerpt: b.excerpt || null }),
        ...(b.body !== undefined      && { body: b.body || null }),
        ...(b.image !== undefined     && { image: b.image || null }),
        ...(b.linkUrl !== undefined   && { linkUrl: b.linkUrl || null }),
        ...(b.published !== undefined && { published: !!b.published }),
        ...(b.order !== undefined     && { order: parseInt(b.order) }),
      },
    });
    return NextResponse.json(post);
  } catch (err: unknown) {
    return NextResponse.json({ error: String((err as Error)?.message ?? "Error") }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
