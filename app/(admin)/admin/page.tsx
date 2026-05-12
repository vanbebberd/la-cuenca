import { prisma } from "@/lib/prisma";
import { Store, Ticket, Users, Star, TrendingUp, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboard() {
  const [businesses, events, users, reviews, pendingReservations, totalPoints] = await Promise.all([
    prisma.business.count(),
    prisma.event.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.review.count(),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.pointsBalance.aggregate({ _sum: { balance: true } }),
  ]);

  const recentBusinesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { city: true, category: true },
  });

  const recentReviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true } },
      business: { select: { name: true } },
    },
  });

  const stats = [
    { label: "Locales", value: businesses, icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Eventos activos", value: events, icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Usuarios", value: users, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Reseñas", value: reviews, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Reservas pendientes", value: pendingReservations, icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
    { label: "Puntos en circulación", value: (totalPoints._sum.balance ?? 0).toLocaleString("es-CL"), icon: Gift, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent businesses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Últimos locales registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBusinesses.map((b) => (
                <div key={b.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.category.name} · {b.city.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : b.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Últimas reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReviews.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.business.name}</p>
                    <p className="text-xs text-gray-500 truncate">{r.user.name ?? "Usuario"}: {r.comment?.slice(0, 60)}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {"★".repeat(r.rating)}<span className="text-xs text-amber-500 ml-1">{r.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
