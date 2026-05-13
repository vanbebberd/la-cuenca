import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  ciudad: z.string(),
  tipo: z.string(),
  presupuesto: z.string(),
  duracion: z.string(),
  intereses: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { ciudad, tipo, presupuesto, duracion, intereses } = parsed.data;

  const businesses = await prisma.business.findMany({
    where: {
      status: "ACTIVE",
      city: { slug: ciudad },
      ...(intereses.length > 0 && { category: { slug: { in: intereses } } }),
    },
    include: { category: true, city: true },
    orderBy: { avgRating: "desc" },
    take: 30,
  });

  const allBusinesses = businesses.length < 5
    ? await prisma.business.findMany({
        where: { status: "ACTIVE", city: { slug: ciudad } },
        include: { category: true, city: true },
        orderBy: { avgRating: "desc" },
        take: 30,
      })
    : businesses;

  const cityName = allBusinesses[0]?.city.name ?? ciudad;

  const businessList = allBusinesses
    .map((b) => `- ${b.name} (${b.category.name}${b.priceRange ? `, precio: ${b.priceRange}` : ""}${b.avgRating > 0 ? `, rating: ${b.avgRating.toFixed(1)}⭐` : ""})`)
    .join("\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `Eres un experto local de la cuenca del Lago Llanquihue en Chile. Armas itinerarios personalizados y auténticos usando los locales reales que te proporcionan.

Responde SIEMPRE en español y SOLO con un JSON válido con esta estructura exacta, sin texto adicional:
{
  "titulo": "título atractivo del panorama",
  "descripcion": "descripción breve del día (2 oraciones)",
  "items": [
    {
      "hora": "HH:MM",
      "lugar": "nombre exacto del local",
      "categoria": "tipo de actividad",
      "descripcion": "qué hacer/comer/ver ahí (1-2 oraciones)",
      "tip": "consejo local opcional"
    }
  ],
  "consejos": ["consejo 1", "consejo 2", "consejo 3"]
}

Usa SOLO los locales de la lista. Si no hay suficientes, menciona actividades genéricas de la zona (el lago, el volcán Osorno) sin inventar nombres de locales.`;

  const userPrompt = `Arma un panorama para:
- Ciudad: ${cityName}
- Tipo de grupo: ${tipo}
- Presupuesto: ${presupuesto}
- Duración: ${duracion === "mañana" ? "solo la mañana (9:00-13:00)" : duracion === "tarde" ? "solo la tarde (14:00-20:00)" : "día completo (9:00-21:00)"}
- Intereses: ${intereses.join(", ") || "variado"}

Locales disponibles en ${cityName}:
${businessList || "No hay locales registrados aún, usa lugares conocidos de la zona."}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al llamar a Claude";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "No se pudo generar el panorama" }, { status: 500 });

  const panorama = JSON.parse(jsonMatch[0]);

  // Build name→slug map for businesses that appear in the panorama
  const placesInPanorama: string[] = (panorama.items ?? []).map((i: { lugar: string }) => i.lugar);
  const matchedBusinesses = placesInPanorama.length > 0
    ? await prisma.business.findMany({
        where: {
          status: "ACTIVE",
          name: { in: placesInPanorama, mode: "insensitive" },
        },
        select: { name: true, slug: true },
      })
    : [];

  const businessLinks: Record<string, string> = {};
  for (const b of matchedBusinesses) {
    businessLinks[b.name.toLowerCase()] = b.slug;
  }

  return NextResponse.json({ ...panorama, businessLinks });
}
