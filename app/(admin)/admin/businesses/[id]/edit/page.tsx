"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRICE_RANGES } from "@/lib/constants";
import { ArrowLeft, Upload, X, ImageIcon, Images } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface City { id: string; name: string; slug: string; }
interface Category { id: string; name: string; slug: string; }
interface HourEntry { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean; }

const DAYS_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function defaultHours(): HourEntry[] {
  return [0, 1, 2, 3, 4, 5, 6].map((d) => ({ dayOfWeek: d, openTime: "09:00", closeTime: "21:00", closed: false }));
}

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hours, setHours] = useState<HourEntry[]>(defaultHours());

  const [form, setForm] = useState({
    name: "", shortDesc: "", description: "", citySlug: "", categorySlug: "",
    priceRange: "", address: "", phone: "", whatsapp: "", email: "",
    website: "", instagram: "", facebook: "", menuUrl: "",
    lat: "", lng: "", pointsEnabled: false, pointsPerPeso: "0.01",
    coverImage: "", status: "ACTIVE", featured: false, plan: "FREE",
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/businesses/${id}`).then(r => r.json()),
      fetch("/api/admin/cities").then(r => r.json()),
      fetch("/api/admin/categories").then(r => r.json()),
    ]).then(([business, citiesData, categoriesData]) => {
      setCities(citiesData);
      setCategories(categoriesData);
      setForm({
        name: business.name ?? "",
        shortDesc: business.shortDesc ?? "",
        description: business.description ?? "",
        citySlug: business.city?.slug ?? "",
        categorySlug: business.category?.slug ?? "",
        priceRange: business.priceRange ?? "",
        address: business.address ?? "",
        phone: business.phone ?? "",
        whatsapp: business.whatsapp ?? "",
        email: business.email ?? "",
        website: business.website ?? "",
        instagram: business.instagram ?? "",
        facebook: business.facebook ?? "",
        menuUrl: business.menuUrl ?? "",
        lat: business.lat?.toString() ?? "",
        lng: business.lng?.toString() ?? "",
        pointsEnabled: business.pointsEnabled ?? false,
        pointsPerPeso: business.pointsPerPeso?.toString() ?? "0.01",
        coverImage: business.coverImage ?? "",
        status: business.status ?? "ACTIVE",
        featured: business.featured ?? false,
        plan: business.plan ?? "FREE",
      });
      setHours([0, 1, 2, 3, 4, 5, 6].map((d) => {
        const existing = (business.hours ?? []).find((h: HourEntry) => h.dayOfWeek === d);
        return existing
          ? { dayOfWeek: d, openTime: existing.openTime ?? "09:00", closeTime: existing.closeTime ?? "21:00", closed: existing.closed }
          : { dayOfWeek: d, openTime: "09:00", closeTime: "21:00", closed: false };
      }));
    }).catch(() => setError("Error cargando local")).finally(() => setLoading(false));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Error subiendo imagen");
      const { url } = await res.json();
      setForm((prev) => ({ ...prev, coverImage: url }));
    } catch {
      setError("Error subiendo la imagen. Verifica las credenciales de Cloudinary.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const [mainRes, hoursRes] = await Promise.all([
        fetch(`/api/admin/businesses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            lat: form.lat ? parseFloat(form.lat) : null,
            lng: form.lng ? parseFloat(form.lng) : null,
            pointsPerPeso: parseFloat(form.pointsPerPeso),
            email: form.email || null,
            priceRange: form.priceRange || null,
            coverImage: form.coverImage || null,
          }),
        }),
        fetch(`/api/admin/businesses/${id}/hours`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hours }),
        }),
      ]);
      if (!mainRes.ok) throw new Error((await mainRes.json()).error ?? "Error al guardar");
      if (!hoursRes.ok) throw new Error("Error guardando horarios");
      router.push("/admin/businesses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, name: keyof typeof form, type = "text") => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <Input name={name} type={type} value={String(form[name])} onChange={handleChange} />
    </div>
  );

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/businesses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Editar local</h1>
        <Link href={`/admin/businesses/${id}/photos`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Images className="h-4 w-4" />
            Galería
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6">

        {/* Cover image */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Foto de portada</h2>
          <div className="relative">
            {form.coverImage ? (
              <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100">
                <Image src={form.coverImage} alt="Portada" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, coverImage: "" }))}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-44 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
              >
                <ImageIcon className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">Click para subir foto</p>
                <p className="text-xs text-gray-300">JPG, PNG o WebP — máx. 10MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          {uploadingImage && <p className="text-sm text-emerald-600">Subiendo imagen...</p>}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">O pega una URL de imagen</label>
            <Input
              name="coverImage"
              type="url"
              value={form.coverImage}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
              <Upload className="h-4 w-4" />
              {uploadingImage ? "Subiendo..." : "Subir desde computador"}
            </Button>
          </div>
        </div>

        {/* Basic info */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Información básica</h2>
          {field("Nombre del local *", "name")}
          {field("Descripción corta", "shortDesc")}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción completa</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad *</label>
              <select name="citySlug" value={form.citySlug} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccionar</option>
                {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría *</label>
              <select name="categorySlug" value={form.categorySlug} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccionar</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
              <select name="priceRange" value={form.priceRange} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Sin especificar</option>
                {PRICE_RANGES.map((p) => <option key={p.value} value={p.value}>{p.label} — {p.description}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="ACTIVE">Activo</option>
                <option value="PENDING">Pendiente</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>
          {field("Dirección", "address")}
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Puntos por peso</label>
              <Input name="pointsPerPeso" type="number" step="0.001" value={form.pointsPerPeso} onChange={handleChange} />
            </div>
          )}
        </div>

        {/* Horarios */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Horarios de atención</h2>
          <div className="space-y-2">
            {DAYS_LABELS.map((day, i) => {
              const h = hours[i];
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-8 shrink-0">{day}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) => {
                        const updated = [...hours];
                        updated[i] = { ...updated[i], closed: e.target.checked };
                        setHours(updated);
                      }}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-400">Cerrado</span>
                  </label>
                  {!h.closed && (
                    <>
                      <Input
                        type="time"
                        value={h.openTime}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[i] = { ...updated[i], openTime: e.target.value };
                          setHours(updated);
                        }}
                        className="h-8 text-xs w-28"
                      />
                      <span className="text-xs text-gray-300">–</span>
                      <Input
                        type="time"
                        value={h.closeTime}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[i] = { ...updated[i], closeTime: e.target.value };
                          setHours(updated);
                        }}
                        className="h-8 text-xs w-28"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan y visibilidad */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Plan y visibilidad</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Plan activo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "FREE", label: "Free", desc: "Listado básico", color: "border-gray-200 text-gray-600", active: "border-gray-500 bg-gray-50 text-gray-900" },
                { value: "BASIC", label: "Basic", desc: "Fotos y contacto", color: "border-blue-200 text-blue-600", active: "border-blue-500 bg-blue-50 text-blue-900" },
                { value: "PRO", label: "Pro", desc: "Destacado + todo", color: "border-amber-200 text-amber-600", active: "border-amber-500 bg-amber-50 text-amber-900" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, plan: p.value, featured: p.value !== "PRO" ? false : prev.featured }))}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${form.plan === p.value ? p.active : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                >
                  <p className="text-sm font-bold">{p.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {form.plan === "PRO" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="rounded w-4 h-4 accent-amber-500" />
              <div>
                <span className="text-sm font-medium text-gray-800">⭐ Destacar en el inicio</span>
                <p className="text-xs text-gray-400">Aparece en la sección de recomendados de la página principal</p>
              </div>
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
