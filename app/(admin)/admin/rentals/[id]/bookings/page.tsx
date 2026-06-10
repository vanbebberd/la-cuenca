"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Booking {
  id: string; confirmCode: string; guestName: string; guestEmail: string; guestPhone?: string;
  checkIn: string; checkOut: string; guests: number; nights: number;
  nightsPrice: number; cleaningFee: number; platformFee: number; totalPrice: number;
  status: string; notes?: string; createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: "Pendiente",  color: "bg-amber-100 text-amber-700",   icon: Clock },
  CONFIRMED: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelada",  color: "bg-red-100 text-red-600",        icon: XCircle },
  COMPLETED: { label: "Completada", color: "bg-blue-100 text-blue-700",      icon: CheckCircle2 },
};

export default function RentalBookingsPage() {
  const { id } = useParams() as { id: string };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/rentals/${id}/bookings`).then((r) => r.json()).then(setBookings).finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(bookingId: string, status: string) {
    const res = await fetch(`/api/admin/rentals/${id}/bookings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    });
    if (res.ok) setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status } : b));
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/rentals/${id}/edit`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Reservas de la propiedad</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Sin reservas aún</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING;
            const Icon = cfg.icon;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon className="h-3 w-3" />{cfg.label}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{b.confirmCode.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{b.guestName}</p>
                    <p className="text-sm text-gray-500">{b.guestEmail}{b.guestPhone && ` · ${b.guestPhone}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900">{formatPrice(b.totalPrice)}</p>
                    <p className="text-xs text-gray-400">{b.nights} noche{b.nights > 1 ? "s" : ""} · {b.guests} huésped{b.guests > 1 ? "es" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 flex-wrap">
                  <span>📅 {new Date(b.checkIn).toLocaleDateString("es-CL")} → {new Date(b.checkOut).toLocaleDateString("es-CL")}</span>
                  <span className="text-xs text-gray-400">Tarifa: {formatPrice(b.nightsPrice)} · Limpieza: {formatPrice(b.cleaningFee)} · Plataforma: {formatPrice(b.platformFee)}</span>
                </div>
                {b.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">{b.notes}</p>}
                {b.status === "PENDING" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => updateStatus(b.id, "CONFIRMED")} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle2 className="h-3.5 w-3.5" />Confirmar</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "CANCELLED")} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"><XCircle className="h-3.5 w-3.5" />Cancelar</Button>
                  </div>
                )}
                {b.status === "CONFIRMED" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "COMPLETED")} className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50">Marcar completada</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "CANCELLED")} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"><XCircle className="h-3.5 w-3.5" />Cancelar</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
