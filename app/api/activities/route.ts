import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city");
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  const activities = await prisma.activity.findMany({
    where: {
      status: "ACTIVE",
      ...(citySlug ? { city: { slug: citySlug } } : {}),
      ...(category ? { category } : {}),
      ...(difficulty ? { difficulty: difficulty as any } : {}),
    },
    include: {
      city: true,
      photos: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(activities);
}
