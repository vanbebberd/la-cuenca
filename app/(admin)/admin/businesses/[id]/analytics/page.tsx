"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, MessageCircle, Phone, Mail, MapPin, CalendarCheck, TrendingUp } from "lucide-react";

interface Totals { VIEW?: number; WHATSAPP_CLICK?: number; CALL_CLICK?: number; EMAIL_CLICK?: number; DIRECTIONS_CLICK?: number; RESERVATION?: number; }
interface DailyEntry { day: string; type: string; count: number; }

const EVENT_CONFIG = {
  VIEW:             { label: "Visitas al perfil",  icon: Eye,           color: "bg-blue-50 text-blue-600 border-blue-100" },
  WHATSAPP_CLICK:   { label: "Clicks WhatsApp",    icon: MessageCircle, color: "bg-green-50 text-green-600 border-green-100" },
  CALL_CLICK:       { label: "Clicks Llamar",      icon: Phone,         color: "bg-purple-50 text-purple-600 border-purple-100" },
  EMAIL_CLICK:      { label: "Clicks Email",        icon: Mail,          color: "bg-sky-50 text-sky-600 border-sky-100" },
  DIRECTIONS_CLICK: { label: "Clicks Cómo llegar", icon: MapPin,        color: "bg-orange-50 text-orange-600 border-orange-100" },
  RESERVATION:      { label: "Reservas",           icon: CalendarCheck, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
} as const;

export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;

  const [totals, setTotals] = useState<Totals>({});
  const [daily, setDaily] = useState<DailyEntry[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/businesses/${id}/analytics?days=${days}`)
      .then((r) => r.json())
      .then(({ totals: t, daily: d }) => { setTotals(t); setDaily(d); })
      .finally(() => setLoading(false));
  }, [id, days]);

  // Build a simple sparkline from daily views
  const viewsByDay: Record<string, number> = {};
  daily.filter((d) => d.type === "VIEW").forEach((d) => { viewsByDay[d.day] = d.count; });
  const viewDays = Object.entries(viewsByDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  const maxViews = Math.max(...viewDays.map(([, v]) => v), 1);

  const totalEvents = Object.values(totals).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/businesses/${id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Estadísticas del local</h1>
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${days === d ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Cargando estadísticas...</div>
      ) : totalEvents === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Sin datos en los últimos {days} días</p>
          <p className="text-xs mt-1">Las estadísticas aparecerán cuando los clientes visiten tu perfil.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {(Object.keys(EVENT_CONFIG) as (keyof typeof EVENT_CONFIG)[]).map((key) => {
              const cfg = EVENT_CONFIG[key];
              const Icon = cfg.icon;
              const count = totals[key] ?? 0;
              return (
                <div key={key} className={`rounded-2xl border p-4 ${cfg.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium opacity-80">{cfg.label}</span>
                  </div>
                  <p className="text-2xl font-black">{count.toLocaleString("es-CL")}</p>
                </div>
              );
            })}
          </div>

          {/* Sparkline */}
          {viewDays.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-4">Visitas diarias (últimos {Math.min(14, viewDays.length)} días)</p>
              <div className="flex items-end gap-1 h-24">
                {viewDays.map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-200 rounded-t-sm hover:bg-blue-400 transition-colors"
                      style={{ height: `${Math.max(4, (count / maxViews) * 80)}px` }}
                      title={`${day}: ${count}`}
                    />
                    <span className="text-[9px] text-gray-400 rotate-45 origin-left w-4 overflow-hidden">{day.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion hint */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-600 mb-1">Tasa de conversión a WhatsApp</p>
            <p className="text-xl font-black text-gray-800">
              {totals.VIEW
                ? `${(((totals.WHATSAPP_CLICK ?? 0) / totals.VIEW) * 100).toFixed(1)}%`
                : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totals.WHATSAPP_CLICK ?? 0} de {totals.VIEW ?? 0} visitantes hicieron click en WhatsApp
            </p>
          </div>
        </>
      )}
    </div>
  );
}
