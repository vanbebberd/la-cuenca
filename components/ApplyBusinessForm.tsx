"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, ImageIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface City { id: string; name: string; slug: string; }
interface Category { id: string; name: string; slug: string; }

const empty = {
  name: "", citySlug: "", categorySlug: "", shortDesc: "", description: "",
  address: "", phone: "", whatsapp: "", email: "", website: "", instagram: "",
};

export function ApplyBusinessForm() {
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/cities").then((r) => r.json()).then(setCities);
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files.slice(0, 6 - photos.length)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/businesses/apply-upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error subiendo foto");
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo foto");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/businesses/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <p className="font-bold text-gray-900 text-lg mb-1">¡Listo, lo recibimos!</p>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Vamos a revisar la info de <span className="font-medium text-gray-700">{form.name}</span> y
          lo publicamos apenas quede activo. Si necesitamos algo más, te contactamos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot: oculto para personas, si un bot lo llena rechazamos silenciosamente */}
      <input
        type="text"
        name="website_hp"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        onChange={(e) => setForm((p) => ({ ...p, website_hp: e.target.value } as typeof p))}
      />

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del negocio *</label>
        <Input name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Café del Volcán" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad *</label>
          <select name="citySlug" value={form.citySlug} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Elegir</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Categoría *</label>
          <select name="categorySlug" value={form.categorySlug} onChange={handleChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Elegir</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">De qué se trata tu negocio</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Cuéntanos qué ofreces, qué lo hace especial..."
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
        <Input name="address" value={form.address} onChange={handleChange} placeholder="Calle y número" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
          <Input name="whatsapp" type="tel" value={form.whatsapp} onChange={handleChange} placeholder="+56 9..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
          <Input name="phone" type="tel" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email de contacto</label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
          <Input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@tunegocio" />
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Fotos (hasta 6)</label>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {photos.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 6 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 h-20 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors text-sm"
          >
            {uploading ? "Subiendo..." : (<><ImageIcon className="h-4 w-4" /> <Upload className="h-4 w-4" /> Subir fotos</>)}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <Button type="submit" disabled={submitting || uploading} className="w-full">
        {submitting ? "Enviando..." : "Enviar mi negocio"}
      </Button>
    </form>
  );
}
