import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Users, Clock, CheckCircle, XCircle, Hourglass } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Reservas" };

const STATUS_CONFIG = {
  PENDING:   { label: "Pendiente",  icon: Hourglass,     bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200" },
  CONFIRMED: { label: "Confirmada", icon: CheckCircle,   bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  CANCELLED: { label: "Cancelada",  icon: XCircle,       bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200" },
};

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: {
      business: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const pending = reservations.filter(r => r.status === "PENDING").length;
  const confirmed = reservations.filter(r => r.status === "CONFIRMED").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Reservas</h1>
        <span className="text-sm text-gray-400">{reservations.length} total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendientes", value: pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Confirmadas", value: confirmed, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total", value: reservations.length, color: "text-gray-700", bg: "bg-gray-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {reservations.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p>No hay reservas aún</p>
            <p className="text-xs text-gray-300 mt-1">Aparecerán aquí cuando los usuarios reserven en tus locales</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reservations.map(r => {
              const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Business + status */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{r.business.name}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      {/* Details row */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(r.date), "d 'de' MMMM yyyy", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {r.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {r.partySize} {r.partySize === 1 ? "persona" : "personas"}
                        </span>
                      </div>
                      {/* Notes */}
                      {r.notes && (
                        <p className="mt-1.5 text-xs text-gray-400 italic">&quot;{r.notes}&quot;</p>
                      )}
                    </div>
                    {/* User info */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-gray-700">{r.user.name ?? "—"}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.user.email}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {format(new Date(r.createdAt), "d MMM HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
