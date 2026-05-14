import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "lacuenca",
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err: unknown) {
    let msg = "Error desconocido";
    if (err instanceof Error) msg = err.message;
    else if (typeof err === "object" && err !== null) {
      const e = err as Record<string, unknown>;
      msg = String(e.message ?? e.error ?? e.http_code ?? JSON.stringify(err));
    } else {
      msg = String(err);
    }
    console.error("[upload] error:", msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
