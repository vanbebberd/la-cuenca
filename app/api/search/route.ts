import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CITIES, CATEGORIES } from "@/lib/constants";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { q } = await req.json();
  if (!q?.trim()) return NextResponse.json({});

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const cityList = CITIES.map(c => `${c.name} → ${c.slug}`).join(", ");
  const catList = CATEGORIES.map(c => `${c.name} → ${c.slug}`).join(", ");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Interpreta esta búsqueda y extrae filtros. Responde SOLO con JSON válido, sin texto adicional.

Ciudades: ${cityList}
Categorías: ${catList}
Precios: BUDGET (barato/económico), MODERATE (moderado/precio medio), EXPENSIVE (caro), LUXURY (lujo)

Búsqueda: "${q}"

JSON de respuesta (usa null si no se menciona):
{"ciudad": "slug|null", "categoria": "slug|null", "priceRange": "BUDGET|MODERATE|EXPENSIVE|LUXURY|null"}`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    const match = text.match(/\{[\s\S]*?\}/);
    const filters = match ? JSON.parse(match[0]) : {};

    // Clean nulls
    Object.keys(filters).forEach(k => { if (filters[k] === "null" || filters[k] === null) delete filters[k]; });

    return NextResponse.json(filters);
  } catch {
    return NextResponse.json({});
  }
}
