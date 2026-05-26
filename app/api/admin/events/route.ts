import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER"))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const events = await prisma.event.findMany({
    include: { city: true, ticketTypes: true },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER"))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { citySlug, defaultTicket, price: _price, capacity: _capacity, ...data } = body;

  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 });

  const slug = data.title
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now();

  const event = await prisma.event.create({
    data: {
      ...data,
      slug,
      cityId: city.id,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });

  // Si es de pago y viene un defaultTicket, crearlo automáticamente
  if (!data.isFree && defaultTicket?.price) {
    await prisma.ticketType.create({
      data: {
        eventId: event.id,
        name: defaultTicket.name ?? "Entrada general",
        price: parseFloat(defaultTicket.price),
        capacity: defaultTicket.capacity ? parseInt(defaultTicket.capacity) : 100,
      },
    });
  }

  return NextResponse.json(event);
}
