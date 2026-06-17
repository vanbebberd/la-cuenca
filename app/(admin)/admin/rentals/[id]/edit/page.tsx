"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Images, CalendarDays, BookOpen, ImageIcon, Upload, X } from "lucide-react";
import { CITIES, RENTAL_AMENITIES } from "@/lib/constants";

export default function EditRentalPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", shortDesc: "", description: "", citySlug: "",
    address: "", pricePerNight: "", cleaningFee: "", platformFeePercent: "",
    maxGuests: "", bedrooms: "", beds: "", bathrooms: "",
    lat: "", lng: "", status: "ACTIVE", featured: false, coverImage: "", bookingUrl: "",
  });

  useEffect(() => {
    fetch(`/api/admin/rentals/${id}`).then((r) => r.json()).then((p) => {
      setForm({
        title: p.title ?? "", shortDesc: p.shortDesc ?? "", description: p.description ?? "",
        citySlug: p.city?.slug ?? "", address: p.address ?? "",
        pricePerNight: p.pricePerNight?.toString() ?? "", cleaningFee: p.cleaningFee?.toString() ?? "0",
        platformFeePercent: p.platformFeePercent?.toString() ?? "10",
        maxGuests: p.maxGuests?.toString() ?? "2", bedrooms: p.bedrooms?.toString() ?? "1",
        beds: p.beds?.toString() ?? "1", bathrooms: p.bathrooms?.toString() ?? "1",
        lat: p.lat?.toString() ?? "", lng: p.lng?.toString() ?? "",
        status: p.status ?? "ACTIVE", featured: p.featured ?? false, coverImage: p.coverImage ?? "",
        bookingUrl: p.bookingUrl ?? "",
      });
      setAmenities(p.amenities ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) { const { url } = await res.json(); setForm((p) => ({ ...p, coverImage: url })); }
    setUploadingImage(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/rentals/${id}`, {
      method: "PATCH",
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
        coverImage: form.coverImage || null,
      }),
    });
    if (!res.ok) { setError((await res.json()).error ?? "Error"); } else { router.push("/admin/rentals"); }
    setSaving(false);
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link href="/admin/rentals"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Editar propiedad</h1>
        <Link href={`/admin/rentals/${id}/photos`}><Button variant="outline" size="sm" className="gap-1.5"><Images className="h-4 w-4" />Fotos</Button></Link>
        <Link href={`/admin/rentals/${id}/calendar`}><Button variant="outline" size="sm" className="gap-1.5"><CalendarDays className="h-4 w-4" />Calendario</Button></Link>
        <Link href={`/admin/rentals/${id}/bookings`}><Button variant="outline" size="sm" className="gap-1.5"><BookOpen className="h-4 w-4" />Reservas</Button></Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6">
        {/* Cover image */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Foto de portada</h2>
          {form.coverImage ? (
            <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100">
              <Image src={form.coverImage} alt="Portada" fill className="object-cover" />
              <button type="button" onClick={() => setForm((p) => ({ ...p, coverImage: "" }))} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} className="h-44 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
              <ImageIcon className="h-8 w-8 text-gray-300" /><p className="text-sm text-gray-400">Click para subir foto</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {uploadingImage && <p className="text-sm text-emerald-600">Subiendo...</p>}
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploadingImage}><Upload className="h-4 w-4" />Subir desde computador</Button>
        </div>

        {/* Same fields as new page */}
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Información básica</h2>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Título *</label><Input name="title" value={form.title} onChange={handleChange} required /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Descripción corta</label><Input name="shortDesc" value={form.shortDesc} onChange={handleChange} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Descripción completa</label><textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Ciudad</label><select name="citySlug" value={form.citySlug} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Estado</label><select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="ACTIVE">Activo</option><option value="PENDING">Pendiente</option><option value="INACTIVE">Inactivo</option></select></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label><Input name="address" value={form.address} onChange={handleChange} /></div>
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Capacidad</h2>
          <div className="grid grid-cols-2 gap-3">
            {[["maxGuests","Huéspedes máx"],["bedrooms","Dormitorios"],["beds","Camas"],["bathrooms","Baños"]].map(([n, l]) => (
              <div key={n}><label className="block text-xs font-medium text-gray-600 mb-1">{l}</label><Input name={n} type="number" min="1" value={form[n as keyof typeof form] as string} onChange={handleChange} /></div>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Precios (CLP)</h2>
          <div className="grid grid-cols-3 gap-3">
            {[["pricePerNight","Precio/noche *"],["cleaningFee","Limpieza"],["platformFeePercent","Comisión %"]].map(([n, l]) => (
              <div key={n}><label className="block text-xs font-medium text-gray-600 mb-1">{l}</label><Input name={n} type="number" min="0" value={form[n as keyof typeof form] as string} onChange={handleChange} /></div>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Reservas externas</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link de reserva (Airbnb, Booking, etc.)</label>
            <Input name="bookingUrl" type="url" placeholder="https://airbnb.com/rooms/..." value={form.bookingUrl} onChange={handleChange} />
          </div>
          <p className="text-xs text-gray-400">Los visitantes verán un botón "Reservar" que los lleva directo a esta URL.</p>
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Ubicación GPS</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Latitud</label><Input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Longitud</label><Input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Comodidades</h2>
          {(["Básico","Vistas","Extras","Reglas","Seguridad"] as const).map((group) => (
            <div key={group}>
              <p className="text-xs font-medium text-gray-400 mb-2">{group}</p>
              <div className="flex flex-wrap gap-2">
                {RENTAL_AMENITIES.filter((a) => a.group === group).map((a) => {
                  const active = amenities.includes(a.id);
                  return <button key={a.id} type="button" onClick={() => setAmenities((p) => active ? p.filter((x) => x !== a.id) : [...p, a.id])} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${active ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}><span>{a.emoji}</span>{a.label}</button>;
                })}
              </div>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer border-t border-gray-100 pt-4">
          <input type="checkbox" name="featured" checked={form.featured as boolean} onChange={handleChange} className="rounded w-4 h-4 accent-amber-500" />
          <span className="text-sm font-medium text-gray-800">⭐ Destacar en el listado</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar cambios"}</Button>
      </form>
    </div>
  );
}
