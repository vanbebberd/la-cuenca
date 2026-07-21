import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 });

  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return new NextResponse(text, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error al obtener el archivo" }, { status: 500 });
  }
}
