import { prisma } from "@/lib/prisma";
import { Gift, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Puntos" };

export default async function AdminPointsPage() {
  const [campaigns, topUsers, recentTx, totals] = await Promise.all([
    prisma.pointsCampaign.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.pointsBalance.findMany({
      orderBy: { balance: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.pointsTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        user: { select: { name: true } },
        business: { select: { name: true } },
      },
    }),
    prisma.pointsBalance.aggregate({ _sum: { balance: true, lifetime: true }, _count: true }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Puntos y Rewards</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Puntos en circulación</p>
                <p className="text-2xl font-bold">{(totals._sum.balance ?? 0).toLocaleString("es-CL")}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Gift className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Total emitidos</p>
                <p className="text-2xl font-bold">{(totals._sum.lifetime ?? 0).toLocaleString("es-CL")}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Wallets activas</p>
                <p className="text-2xl font-bold">{totals._count}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Campañas activas
              <a href="/admin/points/campaigns/new" className="text-xs text-emerald-600 font-normal hover:underline">+ Nueva</a>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hay campañas</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c: (typeof campaigns)[number]) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(c.startDate), "d MMM", { locale: es })} – {format(new Date(c.endDate), "d MMM yyyy", { locale: es })}
                        {" · "}x{c.multiplier}
                      </p>
                    </div>
                    <Badge variant={c.active ? "green" : "secondary"}>{c.active ? "Activa" : "Inactiva"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top usuarios por puntos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.map((u: (typeof topUsers)[number], i: number) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-gray-400 font-bold">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.user.name ?? u.user.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.level}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">{u.balance.toLocaleString("es-CL")} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Últimas transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-700 font-medium truncate">{tx.user.name ?? "Usuario"}</span>
                  {tx.business && <span className="text-gray-400 text-xs truncate">en {tx.business.name}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={tx.type === "EARN" || tx.type === "BONUS" ? "green" : tx.type === "REDEEM" ? "amber" : "secondary"} className="text-xs font-mono">
                    {tx.type === "REDEEM" ? "-" : "+"}{tx.points}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {format(new Date(tx.createdAt), "d/M HH:mm")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
