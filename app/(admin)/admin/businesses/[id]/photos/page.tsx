"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, X, Plus, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Photo { id: string; url: string; alt: string | null; order: number; }

export default function BusinessPhotosPage() {
  const params = useParams();
  const id = params.id as string;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadPhotos() {
    const res = await fetch(`/api/admin/businesses/${id}/photos`);
    const data = await res.json();
    setPhotos(data);
    setLoading(false);
  }

  useEffect(() => { loadPhotos(); }, [id]);

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error("Error subiendo imagen");
      const { url } = await uploadRes.json();
      await addPhoto(url, file.name.replace(/\.[^/.]+$/, ""));
    } catch {
      setMsg("Error subiendo la imagen.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function addPhoto(url: string, alt?: string) {
    const res = await fetch(`/api/admin/businesses/${id}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt: alt ?? altInput }),
    });
    if (res.ok) {
      setUrlInput("");
      setAltInput("");
      setMsg("Foto agregada");
      loadPhotos();
    } else {
      setMsg("Error al agregar foto");
    }
  }

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput) return;
    await addPhoto(urlInput, altInput);
  }

  async function handleDelete(photoId: string) {
    await fetch(`/api/admin/photos/${photoId}`, { method: "DELETE" });
    setPhotos(p => p.filter(x => x.id !== photoId));
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/businesses/${id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Galería de fotos</h1>
          <p className="text-sm text-gray-400">{photos.length} foto{photos.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Upload section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Agregar fotos</h2>

        {/* File upload */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Subir desde tu computador</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Subiendo..." : "Elegir foto"}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadFile} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-gray-100" />
          <span className="text-xs text-gray-400">o pega una URL</span>
          <hr className="flex-1 border-gray-100" />
        </div>

        {/* URL input */}
        <form onSubmit={handleAddUrl} className="space-y-2">
          <Input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            type="url"
          />
          <div className="flex gap-2">
            <Input
              value={altInput}
              onChange={e => setAltInput(e.target.value)}
              placeholder="Descripción de la foto (opcional)"
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!urlInput} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
        </form>

        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      </div>

      {/* Photo grid */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando fotos...</p>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ImageIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay fotos en la galería</p>
          <p className="text-gray-300 text-xs mt-1">Sube fotos para mostrarlas en la página del local</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image src={photo.url} alt={photo.alt ?? ""} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {photo.alt && (
                <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                  <p className="text-white text-xs truncate">{photo.alt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
