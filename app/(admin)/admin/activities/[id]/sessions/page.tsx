"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Users, Clock } from "lucide-react";
import Link from "next/link";

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  maxParticipants: number;
  booked: number;
  active: boolean;
  _count: { bookings: number };
}

export default function ActivitySessionsPage() {
  const { id } = useParams() as { id: string };
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ date: "", startTime: "09:00", endTime: "", maxParticipants: "10" });
  const [msg, setMsg] = useState("");

  async function loadSessions() {
    const res = await fetch(`/api/admin/activities/${id}/sessions`);
    setSessions(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadSessions(); }, [id]);

  async function addSession(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch(`/api/admin/activities/${id}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAdding(false);
    if (res.ok) {
      setMsg("Sesión agregada");
      setForm({ date: "", startTime: "09:00", endTime: "", maxParticipants: "10" });
      loadSessions();
    } else {
      setMsg("Error al agregar");
    }
  }

  async function deleteSession(sessionId: string, booked: number) {
    if (booked > 0 && !confirm(`Esta sesión tiene ${booked} reservas. ¿Eliminar igualmente?`)) return;
    await fetch(`/api/admin/activities/${id}/sessions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setSessions((s) => s.filter((x) => x.id !== sessionId));
  }

  const upcoming = sessions.filter((s) => new Date(s.date) >= new Date());
  const past = sessions.filter((s) => new Date(s.date) < new Date());

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/activities/${id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sesiones</h1>
          <p className="text-sm text-gray-400">{sessions.length} sesión{sessions.length !== 1 ? "es" : ""}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Agregar sesión</h2>
        <form onSubmit={addSession} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha *</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Cupos máximos</label>
              <Input type="number" min="1" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Hora inicio *</label>
              <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Hora fin (opcional)</label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          {msg && <p className={`text-xs ${msg.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>{msg}</p>}
          <Button type="submit" size="sm" disabled={adding} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {adding ? "Agregando..." : "Agregar sesión"}
          </Button>
        </form>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Próximas ({upcoming.length})</h3>
              <div className="space-y-2">
                {upcoming.map((s) => <SessionRow key={s.id} s={s} onDelete={deleteSession} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pasadas ({past.length})</h3>
              <div className="space-y-2 opacity-60">
                {past.map((s) => <SessionRow key={s.id} s={s} onDelete={deleteSession} />)}
              </div>
            </div>
          )}
          {sessions.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400 text-sm">Sin sesiones aún. Agrega la primera arriba.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SessionRow({ s, onDelete }: { s: Session; onDelete: (id: string, booked: number) => void }) {
  const date = new Date(s.date);
  const available = s.maxParticipants - s.booked;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-emerald-50 flex flex-col items-center justify-center shrink-0">
        <span className="text-xs font-bold text-emerald-700">{date.toLocaleDateString("es-CL", { month: "short" }).toUpperCase()}</span>
        <span className="text-lg font-black text-emerald-800 leading-none">{date.getDate()}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          {s.startTime}{s.endTime ? ` → ${s.endTime}` : ""}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.booked}/{s.maxParticipants} reservados</span>
          <span className={available > 0 ? "text-emerald-600" : "text-red-500"}>{available > 0 ? `${available} cupos libres` : "Sin cupos"}</span>
        </div>
      </div>
      <button onClick={() => onDelete(s.id, s.booked)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
