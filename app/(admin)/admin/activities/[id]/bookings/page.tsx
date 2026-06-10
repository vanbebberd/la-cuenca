"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  participants: number;
  totalPrice: number;
  status: string;
  confirmCode: string;
  createdAt: string;
  session: { date: string; startTime: string };
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  PENDING:   { label: "Pendiente",  class: "bg-amber-50 text-amber-700" },
  CONFIRMED: { label: "Confirmada", class: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelada",  class: "bg-red-50 text-red-600" },
  COMPLETED: { label: "Completada", class: "bg-blue-50 text-blue-700" },
  REFUNDED:  { label: "Reembolsada",class: "bg-gray-100 text-gray-500" },
};

export default function ActivityBookingsPage() {
  const { id } = useParams() as { id: string };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/activities/${id}/bookings`)
      .then((r) => r.json())
      .then((d) => { setBookings(d); setLoading(false); });
  }, [id]);

  async function changeStatus(bookingId: string, status: string) {
    await fetch(`/api/admin/activities/${id}/bookings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    });
    setBookings((b) => b.map((x) => x.id === bookingId ? { ...x, status } : x));
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/activities/${id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reservas</h1>
          <p className="text-sm text-gray-400">{bookings.length} reserva{bookings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">Sin reservas aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const s = STATUS_LABELS[b.status] ?? STATUS_LABELS.PENDING;
            const date = new Date(b.session.date);
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900">{b.guestName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.class}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">{b.confirmCode.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{formatPrice(b.totalPrice)}</p>
                    <p className="text-xs text-gray-400">{b.participants} persona{b.participants > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                  <span>{date.toLocaleDateString("es-CL", { day: "numeric", month: "long" })} a las {b.session.startTime}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{b.guestEmail}</span>
                  {b.guestPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{b.guestPhone}</span>}
                </div>
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <div className="flex gap-2">
                    {b.status === "PENDING" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-200" onClick={() => changeStatus(b.id, "CONFIRMED")}>
                        Confirmar
                      </Button>
                    )}
                    {b.status === "CONFIRMED" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1 text-blue-700 border-blue-200" onClick={() => changeStatus(b.id, "COMPLETED")}>
                        Marcar completada
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs gap-1 text-red-600 border-red-200" onClick={() => changeStatus(b.id, "CANCELLED")}>
                      Cancelar
                    </Button>
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
