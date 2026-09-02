import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Asigna una variante del hero por sesión: en la primera visita elige al
// azar entre las fotos disponibles y la fija en una cookie de sesión, así
// no parpadea entre recargas y cada visitante ve una versión.
const HERO_VARIANTS = 2;

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname !== "/" || req.cookies.has("hero")) {
    return NextResponse.next();
  }
  const pick = String(Math.floor(Math.random() * HERO_VARIANTS));
  req.cookies.set("hero", pick);
  const res = NextResponse.next({ request: { headers: req.headers } });
  res.cookies.set("hero", pick, { sameSite: "lax", path: "/" }); // sin maxAge → cookie de sesión
  return res;
}

export const config = { matcher: "/" };
