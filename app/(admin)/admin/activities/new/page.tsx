"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CITIES, ACTIVITY_CATEGORIES, ACTIVITY_INCLUDES } from "@/lib/constants";

export default function NewActivityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [includes, setIncludes] = useState<string[]>([]);
  const [excludes, setExcludes] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch("/api/admin/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, includes, excludes }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/activities/${data.id}/edit`);
    } else {
      let msg = "Error al crear";
      try { const d = await res.json(); msg = d.error ?? msg; } catch {}
      setError(msg);
      setSaving(false);
    }
  }

  function toggleInclude(item: string) {
    setIncludes((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/activities">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nueva actividad</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Información básica</h2>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Título *</label>
            <Input name="title" required placeholder="Ej: Tour en kayak al volcán Osorno" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ciudad *</label>
              <select name="citySlug" required className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2">
                <option value="">Selecciona...</option>
                {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categoría *</label>
              <select name="category" required className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2">
                <option value="">Selecciona...</option>
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dificultad</label>
              <select name="difficulty" className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2">
                <option value="">Sin especificar</option>
                <option value="EASY">Fácil</option>
                <option value="MODERATE">Moderado</option>
                <option value="CHALLENGING">Desafiante</option>
                <option value="EXPERT">Experto</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Duración *</label>
              <Input name="duration" required placeholder="Ej: 2 horas, Medio día" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción corta</label>
            <Input name="shortDesc" placeholder="Resumen en 1-2 líneas para tarjetas" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción completa</label>
            <Textarea name="description" rows={4} placeholder="Describe la experiencia..." />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Precios y cupos</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Precio por persona (CLP) *</label>
              <Input name="pricePerPerson" type="number" min="0" required placeholder="25000" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mínimo personas</label>
              <Input name="minParticipants" type="number" min="1" defaultValue="1" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Máximo personas</label>
              <Input name="maxParticipants" type="number" min="1" defaultValue="10" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Comisión plataforma (%)</label>
            <Input name="platformFeePercent" type="number" min="0" max="100" defaultValue="10" className="max-w-xs" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Punto de encuentro</h2>
          <Input name="meetingPoint" placeholder="Ej: Muelle de Puerto Varas, frente al casino" />
          <div className="grid grid-cols-2 gap-4">
            <Input name="lat" type="number" step="any" placeholder="Latitud (ej: -41.32)" />
            <Input name="lng" type="number" step="any" placeholder="Longitud (ej: -72.98)" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">¿Qué incluye?</h2>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_INCLUDES.map((item) => (
              <button key={item} type="button" onClick={() => toggleInclude(item)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${includes.includes(item) ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                {item}
              </button>
            ))}
          </div>
          {includes.length > 0 && <p className="text-xs text-emerald-600">Seleccionados: {includes.join(", ")}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <label className="text-xs text-gray-500 mb-1 block">Requerimientos / Restricciones</label>
          <Textarea name="requirements" rows={2} placeholder="Ej: Condición física básica requerida. No apto para embarazadas." />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="gap-1.5">
            {saving ? "Creando..." : "Crear actividad"}
          </Button>
          <Link href="/admin/activities">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
