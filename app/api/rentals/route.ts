import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const guests = parseInt(searchParams.get("guests") ?? "1");

  const properties = await prisma.property.findMany({
    where: {
      status: "ACTIVE",
      maxGuests: { gte: guests },
      ...(city && { city: { slug: city } }),
    },
    include: { city: true, photos: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(properties);
}
