import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

// Subida de fotos para el formulario público "Suma tu negocio" (sin sesión).
// Sin auth, así que va con rate limit + validación de tipo/tamaño para no
// convertirse en un hosting de imágenes gratis.
export async function POST(req: NextRequest) {
  const rl = rateLimit(`apply-upload:${clientIp(req)}`, { limit: 12, windowMs: 60 * 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiadas fotos subidas, intenta más tarde" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Formato no permitido (usa JPG, PNG o WEBP)" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La foto pesa más de 8MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "lacuenca/pendientes",
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err: unknown) {
    console.error("[apply-upload] error:", err);
    return NextResponse.json({ error: "Error subiendo la foto" }, { status: 500 });
  }
}
