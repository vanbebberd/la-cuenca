"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Check, X, Upload } from "lucide-react";
import Image from "next/image";

interface City {
  id: string;
  name: string;
  slug: string;
  lat?: number | null;
  lng?: number | null;
  image?: string | null;
  description?: string | null;
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editImage, setEditImage] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/admin/cities");
    const data = await res.json();
    setCities(data);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null }),
    });
    if (res.ok) {
      setName(""); setLat(""); setLng("");
      setMsg("Ciudad creada");
      load();
    } else {
      const err = await res.json();
      setMsg(err.error ?? "Error");
    }
    setLoading(false);
  }

  function startEdit(city: City) {
    setEditing(city.id);
    setEditImage(city.image ?? "");
    setEditDesc(city.description ?? "");
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setEditImage(data.url);
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch(`/api/admin/cities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: editImage, description: editDesc }),
    });
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta ciudad?")) return;
    await fetch(`/api/admin/cities/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Ciudades</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700 text-sm">Nueva ciudad</h2>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Osorno" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Latitud</label>
            <Input value={lat} onChange={e => setLat(e.target.value)} placeholder="-40.5735" type="number" step="0.0001" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Longitud</label>
            <Input value={lng} onChange={e => setLng(e.target.value)} placeholder="-73.1352" type="number" step="0.0001" />
          </div>
        </div>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <Button type="submit" disabled={loading} size="sm">
          <Plus className="h-4 w-4" />
          {loading ? "Creando..." : "Agregar ciudad"}
        </Button>
      </form>

      {/* City list */}
      <div className="space-y-3">
        {cities.map(city => (
          <div key={city.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3">
              {/* Thumbnail */}
              <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {city.image ? (
                  <Image src={city.image} alt={city.name} width={64} height={48} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{city.name}</p>
                <p className="text-xs text-gray-400 truncate">{city.description || "Sin descripción"}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(city)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(city.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Inline edit panel */}
            {editing === city.id && (
              <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Foto</label>
                  {editImage && (
                    <div className="relative h-32 rounded-xl overflow-hidden mb-2 bg-gray-100">
                      <Image src={editImage} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditImage("")}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Subiendo..." : "Subir foto"}
                    </Button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <p className="text-xs text-gray-400 mt-2">O pega una URL directamente:</p>
                  <Input
                    value={editImage}
                    onChange={e => setEditImage(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Descripción corta</label>
                  <Input
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Ej: Orilla del lago, volcán Osorno y gastronomía alemana"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(city.id)} disabled={saving}>
                    <Check className="h-3.5 w-3.5" />
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
