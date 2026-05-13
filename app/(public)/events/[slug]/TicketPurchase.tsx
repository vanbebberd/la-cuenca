"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Ticket, CheckCircle2, Minus, Plus } from "lucide-react";
import Link from "next/link";

interface TicketType {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  capacity: number;
  sold: number;
}

interface Props {
  event: { title: string };
  ticketTypes: TicketType[];
}

export function TicketPurchase({ event, ticketTypes }: Props) {
  const { data: session } = useSession();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function setQty(id: string, delta: number) {
    setQuantities((prev) => {
      const cur = prev[id] ?? 0;
      const tt = ticketTypes.find((t) => t.id === id);
      const max = tt ? tt.capacity - tt.sold : 0;
      const next = Math.max(0, Math.min(cur + delta, Math.min(max, 10)));
      return { ...prev, [id]: next };
    });
  }

  const total = ticketTypes.reduce((s: number, t: (typeof ticketTypes)[number]) => s + (quantities[t.id] ?? 0) * t.price, 0);
  const hasItems = Object.values(quantities).some((q) => q > 0);

  async function handlePurchase() {
    if (!hasItems) return;
    setLoading(true);
    try {
      const items = ticketTypes
        .filter((t) => (quantities[t.id] ?? 0) > 0)
        .map((t) => ({ ticketTypeId: t.id, quantity: quantities[t.id] }));

      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (data.mpCheckoutUrl) {
        window.location.href = data.mpCheckoutUrl;
      } else if (data.free) {
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-900">¡Entradas confirmadas!</p>
        <p className="text-sm text-gray-500 mt-1">Revisa tus entradas en Mis Puntos</p>
        <Link href="/wallet" className="mt-3 block">
          <Button variant="outline" size="sm" className="w-full">Ver mis entradas</Button>
        </Link>
      </div>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center text-gray-400">
        <Ticket className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Sin tickets disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Ticket className="h-4 w-4 text-emerald-600" />
        Comprar entradas
      </h2>

      <div className="space-y-3">
        {ticketTypes.map((t: (typeof ticketTypes)[number]) => {
          const available = t.capacity - t.sold;
          const qty = quantities[t.id] ?? 0;
          return (
            <div key={t.id} className={`rounded-xl border p-3 ${available === 0 ? "opacity-50 bg-gray-50" : "border-gray-200"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{t.name}</p>
                  {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                  <p className="text-sm font-semibold text-emerald-700 mt-1">
                    {t.price === 0 ? "Gratis" : `$${t.price.toLocaleString("es-CL")}`}
                  </p>
                  <p className="text-xs text-gray-400">{available} disponibles</p>
                </div>
                {available > 0 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(t.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30" disabled={qty === 0}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                    <button onClick={() => setQty(t.id, 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30" disabled={qty >= available}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasItems && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm font-semibold mb-3">
            <span>Total</span>
            <span className="text-emerald-700">{total === 0 ? "Gratis" : `$${total.toLocaleString("es-CL")}`}</span>
          </div>
          {session ? (
            <Button className="w-full" onClick={handlePurchase} disabled={loading}>
              {loading ? "Procesando..." : total === 0 ? "Confirmar entrada" : "Pagar con MercadoPago"}
            </Button>
          ) : (
            <Link href="/login">
              <Button className="w-full">Ingresar para comprar</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
