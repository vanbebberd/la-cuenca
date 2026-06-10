"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, ChevronRight, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  maxParticipants: number;
  booked: number;
}

interface Props {
  slug: string;
  pricePerPerson: number;
  platformFeePercent: number;
  minParticipants: number;
  maxParticipants: number;
}

export function SessionPicker({ slug, pricePerPerson, platformFeePercent, minParticipants, maxParticipants }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState(minParticipants);
  const [step, setStep] = useState<"session" | "info">("session");
  const [form, setForm] = useState({ guestName: "", guestEmail: "", guestPhone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/activities/${slug}/sessions`)
      .then((r) => r.json())
      .then((d) => { setSessions(d); setLoading(false); });
  }, [slug]);

  const activityPrice = pricePerPerson * participants;
  const platformFee = Math.round(activityPrice * (platformFeePercent / 100));
  const totalPrice = activityPrice + platformFee;

  async function handleBook() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/activities/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession!.id,
          participants,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al procesar");
      window.location.href = data.mpCheckoutUrl;
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center h-32">
        <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <Calendar className="h-8 w-8 text-gray-200 mx-auto mb-2" />
        <p className="text-gray-500 text-sm font-medium">Sin sesiones disponibles</p>
        <p className="text-gray-400 text-xs mt-1">Próximamente se agregarán nuevas fechas</p>
      </div>
    );
  }

  const groupedByDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    const day = s.date.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-gray-900">{formatPrice(pricePerPerson)}</span>
          <span className="text-sm text-gray-400">/ persona</span>
        </div>
      </div>

      {step === "session" ? (
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Personas</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setParticipants((p) => Math.max(minParticipants, p - 1))}
                className="w-8 h-8 rounded-full border border-gray-200 text-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                disabled={participants <= minParticipants}>−</button>
              <span className="w-8 text-center font-bold text-gray-900">{participants}</span>
              <button onClick={() => setParticipants((p) => Math.min(maxParticipants, p + 1))}
                className="w-8 h-8 rounded-full border border-gray-200 text-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                disabled={participants >= maxParticipants}>+</button>
              <span className="text-xs text-gray-400 ml-1">máx. {maxParticipants}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Elige una sesión</label>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-0.5">
              {Object.entries(groupedByDate).map(([day, daySessions]) => {
                const date = new Date(day + "T12:00:00");
                return (
                  <div key={day}>
                    <p className="text-xs text-gray-500 font-medium mb-1.5 capitalize">
                      {date.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <div className="space-y-1.5">
                      {daySessions.map((s) => {
                        const available = s.maxParticipants - s.booked;
                        const hasSpace = available >= participants;
                        const isSelected = selectedSession?.id === s.id;
                        return (
                          <button key={s.id} onClick={() => hasSpace && setSelectedSession(s)} disabled={!hasSpace}
                            className={`w-full text-left rounded-xl border p-3 transition-all ${isSelected ? "border-emerald-500 bg-emerald-50" : hasSpace ? "border-gray-200 hover:border-emerald-300 hover:bg-gray-50" : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"}`}>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}
                              </span>
                              <span className={`text-xs ${hasSpace ? "text-emerald-600" : "text-red-500"}`}>
                                {hasSpace ? `${available} cupos` : "Sin cupos"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedSession && (
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{formatPrice(pricePerPerson)} × {participants} pers.</span>
                <span>{formatPrice(activityPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarifa de servicio ({platformFeePercent}%)</span>
                <span>{formatPrice(platformFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}

          <Button className="w-full gap-1.5" disabled={!selectedSession} onClick={() => setStep("info")}>
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          <button onClick={() => setStep("session")} className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
            ← Cambiar sesión
          </button>

          <div className="bg-emerald-50 rounded-xl p-3 text-sm">
            <p className="font-medium text-emerald-800">{new Date(selectedSession!.date + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="text-emerald-600 text-xs mt-0.5">{selectedSession!.startTime}{selectedSession!.endTime ? ` – ${selectedSession!.endTime}` : ""} · {participants} persona{participants > 1 ? "s" : ""}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nombre completo *</label>
              <Input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="Tu nombre" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email *</label>
              <Input type="email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Teléfono (opcional)</label>
              <Input type="tel" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} placeholder="+56 9 XXXX XXXX" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Notas (alergias, requerimientos)</label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Opcional..." />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-sm">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button className="w-full" onClick={handleBook} disabled={submitting || !form.guestName || !form.guestEmail}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Procesando...</> : `Reservar · ${formatPrice(totalPrice)}`}
          </Button>
          <p className="text-xs text-gray-400 text-center">Pago seguro vía MercadoPago</p>
        </div>
      )}
    </div>
  );
}
