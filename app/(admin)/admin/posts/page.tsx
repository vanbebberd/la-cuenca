"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, EyeOff, Upload, X, FileText } from "lucide-react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  linkUrl: string | null;
  published: boolean;
  order: number;
}

const empty = { title: "", excerpt: "", image: "", linkUrl: "", order: "0" };

export default function PostsAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(empty);
  const [uploadingNew, setUploadingNew] = useState(false);
  const fileRefNew = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/posts").then(r => r.json()).then(setPosts).finally(() => setLoading(false));
  }, []);

  async function uploadImage(file: File, onUrl: (url: string) => void, setUploading: (v: boolean) => void) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) { const { url } = await res.json(); onUrl(url); }
    setUploading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true); setError("");
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, published: true }),
    });
    if (res.ok) {
      const created = await res.json();
      setPosts(prev => [...prev, created]);
      setForm(empty);
    } else {
      const d = await res.json(); setError(d.error ?? "Error");
    }
    setAdding(false);
  }

  async function handleToggle(post: Post) {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    if (res.ok) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  async function handleFieldSave(post: Post, field: keyof Post, value: string) {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, [field]: value } : p));
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Destacados editoriales</h1>
          <p className="text-xs text-gray-400 mt-0.5">Las 3 primeras cajas publicadas aparecen en el home</p>
        </div>
      </div>

      {/* New post form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Nueva caja</h2>
        {error && <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={handleAdd} className="space-y-3">
          <Input placeholder="Título *  (ej: La mejor picá de Puerto Varas)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          <textarea
            placeholder="Texto / descripción (ej: El secreto mejor guardado del centro, descúbrelo acá)"
            value={form.excerpt}
            onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-16"
          />
          <div className="flex gap-2">
            {form.image ? (
              <div className="relative h-16 w-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                <Image src={form.image} alt="" fill className="object-cover" />
                <button type="button" onClick={() => setForm(p => ({ ...p, image: "" }))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
              </div>
            ) : null}
            <Input placeholder="URL imagen (o sube con el botón)" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="flex-1" />
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={() => fileRefNew.current?.click()} disabled={uploadingNew}>
              <Upload className="h-3.5 w-3.5" />{uploadingNew ? "..." : "Subir"}
            </Button>
            <input ref={fileRefNew} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, url => setForm(p => ({ ...p, image: url })), setUploadingNew); }} />
          </div>
          <div className="flex gap-2">
            <Input placeholder="Link al hacer click (ej: /events, https://...)" value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} className="flex-1" />
            <div className="shrink-0 w-20">
              <Input type="number" min="0" placeholder="Orden" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} />
            </div>
          </div>
          <Button type="submit" disabled={adding || !form.title} size="sm" className="w-full gap-1.5">
            <Plus className="h-4 w-4" />{adding ? "Guardando..." : "Agregar caja"}
          </Button>
        </form>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin cajas aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => <PostRow key={post.id} post={post} onToggle={handleToggle} onDelete={handleDelete} onSave={handleFieldSave} uploadImage={uploadImage} />)}
        </div>
      )}
    </div>
  );
}

function PostRow({ post, onToggle, onDelete, onSave, uploadImage }: {
  post: Post;
  onToggle: (p: Post) => void;
  onDelete: (id: string) => void;
  onSave: (p: Post, field: keyof Post, value: string) => void;
  uploadImage: (file: File, onUrl: (u: string) => void, setUploading: (v: boolean) => void) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ title: post.title, excerpt: post.excerpt ?? "", image: post.image ?? "", linkUrl: post.linkUrl ?? "", order: String(post.order) });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function save() {
    onSave(post, "title", local.title);
    onSave(post, "excerpt", local.excerpt);
    onSave(post, "image", local.image);
    onSave(post, "linkUrl", local.linkUrl);
    onSave(post, "order", local.order);
    setEditing(false);
  }

  return (
    <div className={`bg-white rounded-2xl border p-4 ${post.published ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
      {editing ? (
        <div className="space-y-2">
          <Input value={local.title} onChange={e => setLocal(p => ({ ...p, title: e.target.value }))} placeholder="Título" />
          <textarea value={local.excerpt} onChange={e => setLocal(p => ({ ...p, excerpt: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-16" placeholder="Descripción" />
          <div className="flex gap-2">
            {local.image && (
              <div className="relative h-14 w-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                <Image src={local.image} alt="" fill className="object-cover" />
                <button type="button" onClick={() => setLocal(p => ({ ...p, image: "" }))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X className="h-2.5 w-2.5" /></button>
              </div>
            )}
            <Input value={local.image} onChange={e => setLocal(p => ({ ...p, image: e.target.value }))} placeholder="URL imagen" className="flex-1" />
            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, url => setLocal(p => ({ ...p, image: url })), setUploading); }} />
          </div>
          <div className="flex gap-2">
            <Input value={local.linkUrl} onChange={e => setLocal(p => ({ ...p, linkUrl: e.target.value }))} placeholder="Link" className="flex-1" />
            <Input type="number" value={local.order} onChange={e => setLocal(p => ({ ...p, order: e.target.value }))} className="w-20" placeholder="Orden" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={save} className="flex-1">Guardar</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          {post.image && (
            <div className="relative h-14 w-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-gray-400 font-mono">#{post.order}</span>
              <p className="font-semibold text-sm text-gray-900 truncate">{post.title}</p>
            </div>
            {post.excerpt && <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt}</p>}
            {post.linkUrl && <p className="text-xs text-blue-400 truncate mt-0.5">{post.linkUrl}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onToggle(post)} className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${post.published ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"}`}>
              {post.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 font-medium">Editar</button>
            <button onClick={() => onDelete(post.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
