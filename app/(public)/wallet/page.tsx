import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Gift, Ticket, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEVEL_CONFIG } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi Wallet — Puntos y Entradas" };

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const [balance, transactions, tickets] = await Promise.all([
    prisma.pointsBalance.findUnique({ where: { userId } }),
    prisma.pointsTransaction.findMany({
      where: { userId },
      include: { business: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.ticket.findMany({
      where: { userId },
      include: {
        ticketType: {
          include: {
            event: { include: { city: true } },
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
      take: 20,
    }),
  ]);

  const pts = balance?.balance ?? 0;
  const lifetime = balance?.lifetime ?? 0;
  const level = balance?.level ?? "bronze";
  const levelCfg = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG];
  const nextLevel = Object.entries(LEVEL_CONFIG).find(([, cfg]) => cfg.min > lifetime);
  const progress = nextLevel ? Math.min((lifetime / nextLevel[1].min) * 100, 100) : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Wallet</h1>

      {/* Points card */}
      <div className="rounded-3xl p-6 text-white mb-6" style={{ background: `linear-gradient(135deg, ${levelCfg.color}dd, ${levelCfg.color}88)`, backgroundColor: "#059669" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm">Puntos disponibles</p>
            <p className="text-5xl font-black mt-1">{pts.toLocaleString("es-CL")}</p>
            <p className="text-white/70 text-sm mt-1">{lifetime.toLocaleString("es-CL")} puntos acumulados en total</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
              <Star className="h-4 w-4" />
              <span className="font-semibold text-sm">{levelCfg.label}</span>
            </div>
          </div>
        </div>

        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{levelCfg.label}</span>
              <span>{nextLevel[1].label} en {(nextLevel[1].min - lifetime).toLocaleString("es-CL")} pts</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Historial de puntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Aún no tienes movimientos.{" "}
                <Link href="/directory" className="text-emerald-600 hover:underline">Visita un local</Link> para acumular puntos.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {tx.description ?? (tx.business?.name ?? "Transacción")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(tx.createdAt), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <Badge
                      variant={tx.type === "EARN" || tx.type === "BONUS" ? "green" : tx.type === "REDEEM" ? "amber" : "secondary"}
                      className="font-mono"
                    >
                      {tx.type === "REDEEM" ? "-" : "+"}{tx.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ticket className="h-4 w-4 text-emerald-600" />
              Mis entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No tienes entradas.{" "}
                <Link href="/events" className="text-emerald-600 hover:underline">Ver eventos</Link>
              </p>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className={`rounded-xl border p-3 ${ticket.status === "USED" ? "opacity-50 bg-gray-50" : "border-gray-200"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {ticket.ticketType.event.title}
                        </p>
                        <p className="text-xs text-gray-500">{ticket.ticketType.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(ticket.ticketType.event.startDate), "d MMM yyyy", { locale: es })}
                          {" · "}{ticket.ticketType.event.city.name}
                        </p>
                      </div>
                      <Badge variant={ticket.status === "ACTIVE" ? "green" : ticket.status === "USED" ? "secondary" : "destructive"}>
                        {ticket.status === "ACTIVE" ? "Activa" : ticket.status === "USED" ? "Usada" : "Cancelada"}
                      </Badge>
                    </div>
                    {ticket.status === "ACTIVE" && (
                      <div className="mt-2 font-mono text-xs text-gray-400 bg-gray-50 rounded px-2 py-1 truncate">
                        QR: {ticket.qrCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How to earn */}
      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <h2 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <Gift className="h-4 w-4" />
          ¿Cómo acumular puntos?
        </h2>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Visita locales participantes y muestra tu QR al pagar</li>
          <li>• Por cada $1.000 de compra ganas ~10 puntos</li>
          <li>• Canjea tus puntos por descuentos en locales asociados</li>
          <li>• Sube de nivel para desbloquear más beneficios</li>
        </ul>
      </div>
    </div>
  );
}
