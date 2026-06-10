"use client";
import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  slug: string;
  pricePerNight: number;
  cleaningFee: number;
  platformFeePercent: number;
  maxGuests: number;
}

export function BookingWidget({ slug, pricePerNight, cleaningFee, platformFeePercent, maxGuests }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"dates" | "guest">("dates");
  const [form, setForm] = useState({ guestName: "", guestEmail: "", guestPhone: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nights = checkIn && checkOut ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) : 0;
  const nightsPrice = pricePerNight * nights;
  const platformFee = Math.round((nightsPrice + cleaningFee) * (platformFeePercent / 100));
  const total = nightsPrice + cleaningFee + platformFee;

  useEffect(() => {
    if (!checkIn) return;
    const d = new Date(checkIn);
    fetch(`/api/rentals/${slug}/availability?year=${d.getFullYear()}&month=${d.getMonth() + 1}`)
      .then((r) => r.json()).then(({ unavailable: u }) => setUnavailable(new Set(u)));
  }, [checkIn, slug]);

  function isUnavailable(dateStr: string) { return unavailable.has(dateStr); }

  function validateDates() {
    if (!checkIn || !checkOut) return "Selecciona fechas de entrada y salida";
    if (new Date(checkIn) >= new Date(checkOut)) return "La fecha de salida debe ser posterior a la de entrada";
    if (nights < 1) return "Mínimo 1 noche";
    const cursor = new Date(checkIn);
    while (cursor < new Date(checkOut)) {
      if (isUnavailable(cursor.toISOString().slice(0, 10))) return "Algunas fechas seleccionadas no están disponibles";
      cursor.setDate(cursor.getDate() + 1);
    }
    return null;
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    const err = validateDates();
    if (err) { setError(err); return; }
    if (!form.guestName || !form.guestEmail) { setError("Nombre y email son obligatorios"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/rentals/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertySlug: slug, checkIn, checkOut, guests, ...form }),
    });
    if (!res.ok) { setError((await res.json()).error ?? "Error al reservar"); setLoading(false); return; }
    const { mpCheckoutUrl } = await res.json();
    window.location.href = mpCheckoutUrl;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-24">
      <p className="text-xl font-black text-gray-900 mb-1">{formatPrice(pricePerNight)} <span className="text-sm font-normal text-gray-400">/ noche</span></p>

      {step === "dates" ? (
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Llegada</label>
              <Input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Salida</label>
              <Input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Huéspedes</label>
            <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} huésped{n > 1 ? "es" : ""}</option>
              ))}
            </select>
          </div>

          {nights > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>{formatPrice(pricePerNight)} × {nights} noche{nights > 1 ? "s" : ""}</span><span>{formatPrice(nightsPrice)}</span></div>
              {cleaningFee > 0 && <div className="flex justify-between text-gray-600"><span>Tarifa de limpieza</span><span>{formatPrice(cleaningFee)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Tarifa de servicio ({platformFeePercent}%)</span><span>{formatPrice(platformFee)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5 mt-1.5"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button
            className="w-full"
            disabled={!checkIn || !checkOut || nights < 1}
            onClick={() => { const e = validateDates(); if (e) { setError(e); } else { setError(""); setStep("guest"); } }}
          >
            Continuar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleBook} className="space-y-3 mt-4">
          <p className="text-sm font-semibold text-gray-700">Datos del huésped</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
            <Input value={form.guestName} onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <Input type="email" value={form.guestEmail} onChange={(e) => setForm((p) => ({ ...p, guestEmail: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono / WhatsApp</label>
            <Input value={form.guestPhone} onChange={(e) => setForm((p) => ({ ...p, guestPhone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas (opcional)</label>
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-16" placeholder="Hora de llegada, necesidades especiales..." />
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 text-sm font-semibold text-emerald-800 flex justify-between">
            <span>Total a pagar</span><span>{formatPrice(total)}</span>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep("dates")}>Volver</Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Procesando...</> : "Reservar y pagar"}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-400">Serás redirigido a MercadoPago</p>
        </form>
      )}
    </div>
  );
}
