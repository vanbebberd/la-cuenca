import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Allowed = { ok: true; role: "ADMIN" | "BUSINESS_OWNER"; userId: string };
type Denied = { ok: false; response: NextResponse };

/**
 * Autoriza una operación sobre un local concreto.
 * - ADMIN: acceso total.
 * - BUSINESS_OWNER: solo si es el dueño (`business.ownerId`).
 * - Cualquier otro / sin sesión: 403.
 *
 * Uso:
 *   const access = await requireBusinessAccess(id);
 *   if (!access.ok) return access.response;
 */
export async function requireBusinessAccess(businessId: string): Promise<Allowed | Denied> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const deny = (): Denied => ({
    ok: false,
    response: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
  });

  if (!session || !userId || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) return deny();
  if (role === "ADMIN") return { ok: true, role, userId };

  const biz = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true },
  });
  if (!biz || biz.ownerId !== userId) return deny();

  return { ok: true, role, userId };
}
