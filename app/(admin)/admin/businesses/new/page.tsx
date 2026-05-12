"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRICE_RANGES } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface City { id: string; name: string; slug: string; }
interface Category { id: string; name: string; slug: string; }

export default function NewBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "", shortDesc: "", description: "", citySlug: "", categorySlug: "",
    priceRange: "", address: "", phone: "", whatsapp: "", email: "",
    website: "", instagram: "", facebook: "", menuUrl: "",
    lat: "", lng: "", pointsEnabled: false, pointsPerPeso: "0.01",
  });

  useEffect(() => {
    fetch("/api/admin/cities").then(r => r.json()).then(setCities);
    fetch("/api/admin/categories").then(r => r.json()).then(setCategories);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          pointsPerPeso: parseFloat(form.pointsPerPeso),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al crear local");
      router.push("/admin/businesses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, name: keyof typeof form, type = "text", required = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && " *"}</label>
      <Input name={name} type={type} value={String(form[name])} onChange={handleChange} required={required} />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/businesses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nuevo local</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6">
        {/* Basic info */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Información básica</h2>
          {field("Nombre del local", "name", "text", true)}
          {field("Descripción corta", "shortDesc")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción completa</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad *</label>
              <select name="citySlug" value={form.citySlug} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccionar ciudad</option>
                {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría *</label>
              <select name="categorySlug" value={form.categorySlug} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rango de precio</label>
              <select name="priceRange" value={form.priceRange} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Sin especificar</option>
                {PRICE_RANGES.map((p) => <option key={p.value} value={p.value}>{p.label} — {p.description}</option>)}
              </select>
            </div>
            {field("Dirección", "address")}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Contacto</h2>
          <div className="grid grid-cols-2 gap-3">
            {field("Teléfono", "phone", "tel")}
            {field("WhatsApp", "whatsapp", "tel")}
            {field("Email", "email", "email")}
            {field("Sitio web", "website", "url")}
            {field("Instagram (@)", "instagram")}
            {field("Facebook", "facebook")}
          </div>
          {field("URL Carta/Menú", "menuUrl", "url")}
        </div>

        {/* Location */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Ubicación GPS</h2>
          <div className="grid grid-cols-2 gap-3">
            {field("Latitud", "lat", "number")}
            {field("Longitud", "lng", "number")}
          </div>
          <p className="text-xs text-gray-400">💡 Google Maps → click derecho en la ubicación → copiar coordenadas</p>
        </div>

        {/* Points */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Sistema de puntos</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="pointsEnabled" checked={form.pointsEnabled} onChange={handleChange} className="rounded" />
            <span className="text-sm text-gray-700">Activar puntos en este local</span>
          </label>
          {form.pointsEnabled && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Puntos por peso (ej: 0.01 = 10 pts por $1.000)</label>
              <Input name="pointsPerPeso" type="number" step="0.001" value={form.pointsPerPeso} onChange={handleChange} />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creando..." : "Crear local"}
        </Button>
      </form>
    </div>
  );
}
