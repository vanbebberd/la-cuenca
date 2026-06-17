"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { CITIES, RENTAL_AMENITIES } from "@/lib/constants";

export default function NewRentalPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", shortDesc: "", description: "", citySlug: CITIES[0].slug,
    address: "", pricePerNight: "", cleaningFee: "0", platformFeePercent: "10",
    maxGuests: "2", bedrooms: "1", beds: "1", bathrooms: "1",
    lat: "", lng: "", status: "ACTIVE", featured: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amenities,
        pricePerNight: parseFloat(form.pricePerNight),
        cleaningFee: parseFloat(form.cleaningFee),
        platformFeePercent: parseFloat(form.platformFeePercent),
        maxGuests: parseInt(form.maxGuests),
        bedrooms: parseInt(form.bedrooms),
        beds: parseInt(form.beds),
        bathrooms: parseInt(form.bathrooms),
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      }),
    });
    if (!res.ok) { setError((await res.json()).error ?? "Error"); setSaving(false); return; }
    const prop = await res.json();
    router.push(`/admin/rentals/${prop.id}/edit`);
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/rentals"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-xl font-bold text-gray-900">Nueva propiedad</h1>
      </div>
      <form onSubmit={handleSave} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6">
        <Section title="Información básica">
          <Field label="Título *"><Input name="title" value={form.title} onChange={handleChange} required /></Field>
          <Field label="Descripción corta"><Input name="shortDesc" value={form.shortDesc} onChange={handleChange} /></Field>
          <Field label="Descripción completa">
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad *">
              <select name="citySlug" value={form.citySlug} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="ACTIVE">Activo</option>
                <option value="PENDING">Pendiente</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </Field>
          </div>
          <Field label="Dirección"><Input name="address" value={form.address} onChange={handleChange} /></Field>
        </Section>

        <Section title="Capacidad">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Huéspedes máx"><Input name="maxGuests" type="number" min="1" value={form.maxGuests} onChange={handleChange} /></Field>
            <Field label="Dormitorios"><Input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} /></Field>
            <Field label="Camas"><Input name="beds" type="number" min="1" value={form.beds} onChange={handleChange} /></Field>
            <Field label="Baños"><Input name="bathrooms" type="number" min="1" value={form.bathrooms} onChange={handleChange} /></Field>
          </div>
        </Section>

        <Section title="Precios (CLP)">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Precio por noche *"><Input name="pricePerNight" type="number" min="0" value={form.pricePerNight} onChange={handleChange} required /></Field>
            <Field label="Tarifa limpieza"><Input name="cleaningFee" type="number" min="0" value={form.cleaningFee} onChange={handleChange} /></Field>
            <Field label="Comisión plataforma %"><Input name="platformFeePercent" type="number" min="0" max="30" step="0.5" value={form.platformFeePercent} onChange={handleChange} /></Field>
          </div>
        </Section>

        <Section title="Ubicación GPS">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitud"><Input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} /></Field>
            <Field label="Longitud"><Input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} /></Field>
          </div>
          <p className="text-xs text-gray-400">💡 Google Maps → click derecho → copiar coordenadas</p>
        </Section>

        <Section title="Comodidades">
          {(["Básico", "Vistas", "Extras", "Reglas", "Seguridad"] as const).map((group) => {
            const items = RENTAL_AMENITIES.filter((a) => a.group === group);
            return (
              <div key={group}>
                <p className="text-xs font-medium text-gray-400 mb-2">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((a) => {
                    const active = amenities.includes(a.id);
                    return (
                      <button key={a.id} type="button" onClick={() => setAmenities((p) => active ? p.filter((x) => x !== a.id) : [...p, a.id])}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${active ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        <span>{a.emoji}</span>{a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Section>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="featured" checked={form.featured as boolean} onChange={handleChange} className="rounded w-4 h-4 accent-amber-500" />
          <span className="text-sm font-medium text-gray-800">⭐ Destacar en el listado</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">{saving ? "Guardando..." : "Crear propiedad"}</Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-t border-gray-100 pt-4 first:border-0 first:pt-0">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
