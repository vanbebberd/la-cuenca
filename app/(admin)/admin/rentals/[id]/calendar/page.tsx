"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default function RentalCalendarPage() {
  const { id } = useParams() as { id: string };
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/rentals/${id}/blocked?year=${year}&month=${month}`)
      .then((r) => r.json()).then((dates: string[]) => setBlocked(new Set(dates)));
  }, [id, year, month]);

  function prevMonth() { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); }

  function toggleDay(dateStr: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  }

  async function handleBlock() {
    setSaving(true);
    await fetch(`/api/admin/rentals/${id}/blocked`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates: Array.from(selected), reason: "MAINTENANCE" }),
    });
    setBlocked((prev) => new Set([...prev, ...selected]));
    setSelected(new Set());
    setSaving(false);
  }

  async function handleUnblock() {
    setSaving(true);
    await fetch(`/api/admin/rentals/${id}/blocked`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates: Array.from(selected) }),
    });
    setBlocked((prev) => { const next = new Set(prev); selected.forEach((d) => next.delete(d)); return next; });
    setSelected(new Set());
    setSaving(false);
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DAY_NAMES = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

  const selectedBlocked = Array.from(selected).filter((d) => blocked.has(d));
  const selectedFree = Array.from(selected).filter((d) => !blocked.has(d));

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/rentals/${id}/edit`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Calendario de disponibilidad</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-4 w-4" /></button>
          <p className="text-sm font-bold text-gray-800">{MONTH_NAMES[month - 1]} {year}</p>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map((d) => <p key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</p>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPast = new Date(dateStr) < new Date(today.toISOString().slice(0, 10));
            const isBlocked = blocked.has(dateStr);
            const isSelected = selected.has(dateStr);
            return (
              <button
                key={day}
                disabled={isPast}
                onClick={() => !isPast && toggleDay(dateStr)}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${isPast ? "text-gray-200 cursor-default" :
                    isSelected ? "bg-emerald-600 text-white ring-2 ring-emerald-400" :
                    isBlocked ? "bg-red-100 text-red-500 hover:bg-red-200" :
                    "hover:bg-gray-100 text-gray-700"}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" />Bloqueado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600" />Seleccionado</span>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">{selected.size} día{selected.size > 1 ? "s" : ""} seleccionado{selected.size > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            {selectedFree.length > 0 && (
              <Button size="sm" onClick={handleBlock} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white">Bloquear</Button>
            )}
            {selectedBlocked.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleUnblock} disabled={saving}>Desbloquear</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Limpiar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
