"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Users, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function ReservationForm({ businessId, businessName }: { businessId: string; businessName: string }) {
  const { data: session } = useSession();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("2");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, date, time, partySize: Number(people), notes }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al reservar");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reservar");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
        <p className="font-semibold text-gray-900">Reserva enviada</p>
        <p className="text-sm text-gray-500 mt-1">Te confirmaremos en breve</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-emerald-600" />
        Hacer reserva
      </h2>

      {!session ? (
        <div className="text-center py-3">
          <p className="text-sm text-gray-500 mb-3">Inicia sesión para reservar</p>
          <Link href="/login"><Button size="sm" className="w-full">Ingresar</Button></Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Fecha</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block flex items-center gap-1">
              <Clock className="h-3 w-3" />Hora
            </label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block flex items-center gap-1">
              <Users className="h-3 w-3" />Personas
            </label>
            <Input type="number" min="1" max="20" value={people} onChange={(e) => setPeople(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, ocasión especial..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-16"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Confirmar reserva"}
          </Button>
        </form>
      )}
    </div>
  );
}
