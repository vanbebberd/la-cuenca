import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      city: true,
      photos: { orderBy: { order: "asc" } },
    },
  });
  if (!property) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(property);
}
