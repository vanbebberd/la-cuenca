"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface City { name: string; slug: string; }

export default function NewEventPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", citySlug: "", location: "",
    startDate: "", endDate: "", image: "", published: false, featured: false,
  });

  useEffect(() => {
    fetch("/api/admin/cities").then(r => r.json()).then(setCities);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al guardar");
      const data = await res.json();
      router.push(`/admin/events/${data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nuevo evento</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Título *</label>
          <Input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ciudad *</label>
            <select name="citySlug" value={form.citySlug} onChange={handleChange} required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Seleccionar</option>
              {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Lugar</label>
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Teatro, plaza..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha inicio *</label>
            <Input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha fin</label>
            <Input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">URL imagen</label>
          <Input name="image" type="url" value={form.image} onChange={handleChange} placeholder="https://..." />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="rounded accent-emerald-600" />
            Publicado
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="rounded accent-amber-500" />
            ⭐ Destacado
          </label>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Creando..." : "Crear evento"}
        </Button>
      </form>
    </div>
  );
}
