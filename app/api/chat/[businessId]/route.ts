import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const maxDuration = 60;

const schema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(10).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;

  const business = await prisma.business.findUnique({
    where: { id: businessId, status: "ACTIVE" },
    include: {
      category: true,
      city: true,
      hours: { orderBy: { dayOfWeek: "asc" } },
      products: { where: { available: true }, orderBy: [{ order: "asc" }], take: 50 },
      productSections: { orderBy: { order: "asc" } },
      offers: { where: { active: true } },
      rewards: { where: { active: true } },
    },
  });

  if (!business) return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });

  const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const hoursText = business.hours.length
    ? business.hours.map((h) => `${DAYS[h.dayOfWeek]}: ${h.closed ? "Cerrado" : `${h.openTime ?? "?"} - ${h.closeTime ?? "?"}`}`).join(", ")
    : "No especificado";

  const productsText = business.products.length
    ? business.products.map((p) => {
        const section = business.productSections.find((s) => s.id === p.sectionId);
        return `- ${p.name}${section ? ` [${section.name}]` : ""}${p.price ? ` — $${p.price.toLocaleString("es-CL")}` : ""}${p.description ? `: ${p.description}` : ""}`;
      }).join("\n")
    : "No hay catálogo disponible";

  const offersText = business.offers.length
    ? business.offers.map((o) => `- ${o.title}${o.badge ? ` (${o.badge})` : ""}${o.description ? `: ${o.description}` : ""}${o.validTo ? ` — válido hasta ${new Date(o.validTo).toLocaleDateString("es-CL")}` : ""}`).join("\n")
    : "Sin ofertas activas";

  const systemPrompt = `Eres el asistente virtual de "${business.name}", un ${business.category.name} ubicado en ${business.city.name}, Chile.

INFORMACIÓN DEL LOCAL:
- Dirección: ${business.address ?? "No especificada"}
- Teléfono: ${business.phone ?? "No disponible"}
- WhatsApp: ${business.whatsapp ?? "No disponible"}
- Descripción: ${business.description ?? business.shortDesc ?? "Sin descripción"}
- Horarios: ${hoursText}
${business.priceRange ? `- Rango de precios: ${business.priceRange}` : ""}

CATÁLOGO:
${productsText}

OFERTAS ACTIVAS:
${offersText}

${business.rewards.length ? `RECOMPENSAS CANJEABLES:\n${business.rewards.map((r) => `- ${r.title}: ${r.pointsCost} puntos`).join("\n")}` : ""}

INSTRUCCIONES:
- Responde siempre en español, de forma amable y concisa (máximo 3 oraciones).
- Solo contesta preguntas sobre este local. Para reservas, da el teléfono/WhatsApp.
- Si no sabes algo, di que consulten directamente al local.
- No inventes información que no esté arriba.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages: Anthropic.MessageParam[] = [
    ...(parsed.data.history ?? []),
    { role: "user", content: parsed.data.message },
  ];

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}
