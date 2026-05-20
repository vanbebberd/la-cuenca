"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    multiplier: "2",
    startDate: "",
    endDate: "",
    active: true,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al guardar");
      router.push("/admin/points");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/points">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nueva campaña de puntos</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Doble puntos verano" required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Multiplicador de puntos *</label>
          <Input name="multiplier" type="number" min="1" step="0.5" value={form.multiplier} onChange={handleChange} required />
          <p className="text-xs text-gray-400 mt-1">x{form.multiplier} puntos por cada peso gastado</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha inicio *</label>
            <Input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha fin *</label>
            <Input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} required />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="rounded accent-emerald-600" />
          Activa inmediatamente
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Creando..." : "Crear campaña"}
        </Button>
      </form>
    </div>
  );
}
