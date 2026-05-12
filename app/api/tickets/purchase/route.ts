import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";

const schema = z.object({
  items: z.array(z.object({
    ticketTypeId: z.string(),
    quantity: z.number().int().min(1).max(10),
  })),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const { items } = parsed.data;

  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: items.map((i) => i.ticketTypeId) }, active: true },
    include: { event: true },
  });

  for (const item of items) {
    const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
    if (!tt) return NextResponse.json({ error: "Tipo de ticket no encontrado" }, { status: 404 });
    if (tt.sold + item.quantity > tt.capacity) {
      return NextResponse.json({ error: `No hay suficientes entradas para ${tt.name}` }, { status: 400 });
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!;
    return sum + tt.price * item.quantity;
  }, 0);

  if (totalAmount === 0) {
    await prisma.$transaction(
      items.flatMap((item) => {
        return [
          prisma.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { sold: { increment: item.quantity } },
          }),
          ...Array.from({ length: item.quantity }, () =>
            prisma.ticket.create({ data: { ticketTypeId: item.ticketTypeId, userId } })
          ),
        ];
      })
    );
    return NextResponse.json({ free: true });
  }

  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
  const preference = new Preference(mpClient);

  const mpItems = items.map((item) => {
    const tt = ticketTypes.find((t) => t.id === item.ticketTypeId)!;
    return {
      id: item.ticketTypeId,
      title: `${tt.event.title} — ${tt.name}`,
      quantity: item.quantity,
      unit_price: tt.price,
      currency_id: "CLP",
    };
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const pref = await preference.create({
    body: {
      items: mpItems,
      back_urls: {
        success: `${baseUrl}/wallet`,
        failure: `${baseUrl}/events`,
        pending: `${baseUrl}/wallet`,
      },
      auto_return: "approved",
      metadata: {
        userId,
        items: JSON.stringify(items),
      },
    },
  });

  return NextResponse.json({ mpCheckoutUrl: pref.init_point });
}
