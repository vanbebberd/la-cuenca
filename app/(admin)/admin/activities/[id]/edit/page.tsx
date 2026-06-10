"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CalendarDays, Camera, BookOpen } from "lucide-react";
import Link from "next/link";
import { CITIES, ACTIVITY_CATEGORIES, ACTIVITY_INCLUDES } from "@/lib/constants";

export default function EditActivityPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [includes, setIncludes] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/admin/activities/${id}`)
      .then((r) => r.json())
      .then((d) => { setActivity(d); setIncludes(d.includes ?? []); });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/admin/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, includes }),
    });
    setSaving(false);
    if (res.ok) setMsg("Guardado correctamente");
    else setMsg("Error al guardar");
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta actividad?")) return;
    await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
    router.push("/admin/activities");
  }

  function toggleInclude(item: string) {
    setIncludes((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }

  if (!activity) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/activities">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 truncate">{activity.title}</h1>
          <p className="text-xs text-gray-400">/{activity.slug}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Link href={`/admin/activities/${id}/photos`}>
          <Button variant="outline" size="sm" className="gap-1.5"><Camera className="h-3.5 w-3.5" />Fotos</Button>
        </Link>
        <Link href={`/admin/activities/${id}/sessions`}>
          <Button variant="outline" size="sm" className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Sesiones</Button>
        </Link>
        <Link href={`/admin/activities/${id}/bookings`}>
          <Button variant="outline" size="sm" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />Reservas</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Información básica</h2>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Título</label>
            <Input name="title" defaultValue={activity.title} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ciudad</label>
              <select name="citySlug" defaultValue={activity.city.slug} className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2">
                {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
              <select name="category" defaultValue={activity.category} className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2">
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Estado</label>
              <select name="status" defaultValue={activity.status} className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2">
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dificultad</label>
              <select name="difficulty" defaultValue={activity.difficulty ?? ""} className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2">
                <option value="">Sin especificar</option>
                <option value="EASY">Fácil</option>
                <option value="MODERATE">Moderado</option>
                <option value="CHALLENGING">Desafiante</option>
                <option value="EXPERT">Experto</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Duración</label>
              <Input name="duration" defaultValue={activity.duration} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Destacada</label>
            <input type="checkbox" name="featured" defaultChecked={activity.featured} className="rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción corta</label>
            <Input name="shortDesc" defaultValue={activity.shortDesc ?? ""} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción completa</label>
            <Textarea name="description" rows={4} defaultValue={activity.description ?? ""} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Precios y cupos</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Precio/persona (CLP)</label>
              <Input name="pricePerPerson" type="number" defaultValue={activity.pricePerPerson} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mínimo</label>
              <Input name="minParticipants" type="number" defaultValue={activity.minParticipants} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Máximo</label>
              <Input name="maxParticipants" type="number" defaultValue={activity.maxParticipants} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Comisión plataforma (%)</label>
            <Input name="platformFeePercent" type="number" defaultValue={activity.platformFeePercent} className="max-w-xs" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Punto de encuentro</h2>
          <Input name="meetingPoint" defaultValue={activity.meetingPoint ?? ""} placeholder="Ej: Muelle principal de Puerto Varas" />
          <div className="grid grid-cols-2 gap-4">
            <Input name="lat" type="number" step="any" defaultValue={activity.lat ?? ""} placeholder="Latitud" />
            <Input name="lng" type="number" step="any" defaultValue={activity.lng ?? ""} placeholder="Longitud" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">¿Qué incluye?</h2>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_INCLUDES.map((item) => (
              <button key={item} type="button" onClick={() => toggleInclude(item)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${includes.includes(item) ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <label className="text-xs text-gray-500 mb-1 block">Requerimientos</label>
          <Textarea name="requirements" rows={2} defaultValue={activity.requirements ?? ""} />
        </div>

        {msg && <p className={`text-sm ${msg.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>{msg}</p>}

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>Eliminar actividad</Button>
        </div>
      </form>
    </div>
  );
}
