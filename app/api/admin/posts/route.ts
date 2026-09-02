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

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(); if (deny) return deny;
  try {
    const { title, slug, excerpt, body, image, linkUrl, published, order } = await req.json();
    if (!title) return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });

    let finalSlug: string | null = (slug ? slugify(slug) : slugify(title)) || null;
    if (finalSlug) {
      const clash = await prisma.post.findUnique({ where: { slug: finalSlug } });
      if (clash) finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        body: body || null,
        image: image || null,
        linkUrl: linkUrl || null,
        published: !!published,
        order: order ? parseInt(order) : 0,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String((err as Error)?.message ?? "Error") }, { status: 500 });
  }
}
