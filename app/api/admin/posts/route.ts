import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  const role = (s?.user as any)?.role;
  return role === "ADMIN" || role === "BUSINESS_OWNER" ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(); if (deny) return deny;
  try {
    const { title, excerpt, image, linkUrl, published, order } = await req.json();
    if (!title) return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    const post = await prisma.post.create({
      data: { title, excerpt: excerpt || null, image: image || null, linkUrl: linkUrl || null, published: !!published, order: order ? parseInt(order) : 0 },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? "Error") }, { status: 500 });
  }
}
