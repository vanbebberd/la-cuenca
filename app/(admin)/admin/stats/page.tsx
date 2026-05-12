import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Estadísticas" };

export default async function AdminStatsPage() {
  const [businesses, events, users, reviews, reservations] = await Promise.all([
    prisma.business.count(),
    prisma.event.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.reservation.count(),
  ]);

  const activeBusinesses = await prisma.business.count({ where: { status: "ACTIVE" } });
  const publishedEvents = await prisma.event.count({ where: { published: true } });

  const stats = [
    { label: "Locales activos", value: activeBusinesses, total: businesses, color: "emerald" },
    { label: "Eventos publicados", value: publishedEvents, total: events, color: "blue" },
    { label: "Usuarios registrados", value: users, total: users, color: "violet" },
    { label: "Reseñas", value: reviews, total: reviews, color: "amber" },
    { label: "Reservas", value: reservations, total: reservations, color: "rose" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Estadísticas</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-3xl font-black text-gray-900">{s.value}</div>
            {s.total !== s.value && (
              <div className="text-xs text-gray-400">de {s.total} total</div>
            )}
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
