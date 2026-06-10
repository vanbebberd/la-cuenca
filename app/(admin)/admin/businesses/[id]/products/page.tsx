"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Upload, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

interface ProductSection { id: string; name: string; order: number; }
interface Product { id: string; sectionId?: string | null; name: string; description?: string | null; price?: number | null; image?: string | null; available: boolean; order: number; }

export default function ProductsAdminPage() {
  const params = useParams();
  const id = params.id as string;

  const [sections, setSections] = useState<ProductSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [newSection, setNewSection] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", sectionId: "", image: "" });
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/businesses/${id}/products`)
      .then((r) => r.json())
      .then(({ sections: s, products: p }) => { setSections(s); setProducts(p); })
      .catch(() => setError("Error cargando catálogo"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault();
    setAddingSection(true);
    const res = await fetch(`/api/admin/businesses/${id}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "section", sectionName: newSection, sectionOrder: sections.length }),
    });
    if (res.ok) { const s = await res.json(); setSections((prev) => [...prev, s]); setNewSection(""); }
    setAddingSection(false);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setAddingProduct(true);
    const res = await fetch(`/api/admin/businesses/${id}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProduct,
        price: newProduct.price ? parseFloat(newProduct.price) : undefined,
        sectionId: newProduct.sectionId || undefined,
        order: products.length,
      }),
    });
    if (res.ok) { const p = await res.json(); setProducts((prev) => [...prev, p]); setNewProduct({ name: "", description: "", price: "", sectionId: "", image: "" }); }
    setAddingProduct(false);
  }

  async function handleDeleteProduct(productId: string) {
    await fetch(`/api/admin/businesses/${id}/products`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  async function handleDeleteSection(sectionId: string) {
    await fetch(`/api/admin/businesses/${id}/products`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId }),
    });
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setProducts((prev) => prev.map((p) => p.sectionId === sectionId ? { ...p, sectionId: null } : p));
  }

  async function handleToggleAvailable(product: Product) {
    const res = await fetch(`/api/admin/businesses/${id}/products`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, available: !product.available }),
    });
    if (res.ok) setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, available: !p.available } : p));
  }

  async function handleImageUpload(productId: string, file: File) {
    setUploading(productId);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      await fetch(`/api/admin/businesses/${id}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, image: url }),
      });
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, image: url } : p));
    }
    setUploading(null);
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  const unsectioned = products.filter((p) => !p.sectionId);

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/businesses/${id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Catálogo de productos</h1>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* Add section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Nueva sección</h2>
        <form onSubmit={handleAddSection} className="flex gap-2">
          <Input
            placeholder="Ej: Entradas, Bebidas, Platos principales..."
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={addingSection || !newSection} size="sm">
            <Plus className="h-4 w-4" />
            {addingSection ? "..." : "Agregar"}
          </Button>
        </form>
      </div>

      {/* Sections & products */}
      {sections.map((section) => (
        <div key={section.id} className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">{section.name}</p>
            <button onClick={() => handleDeleteSection(section.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {products.filter((p) => p.sectionId === section.id).map((product) => (
              <ProductRow key={product.id} product={product} onDelete={handleDeleteProduct} onToggle={handleToggleAvailable} onImageUpload={handleImageUpload} uploading={uploading} fileRef={(el) => { fileRefs.current[product.id] = el; }} />
            ))}
          </div>
        </div>
      ))}

      {/* Unsectioned */}
      {unsectioned.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-500">Sin sección</p>
          </div>
          <div className="divide-y divide-gray-50">
            {unsectioned.map((product) => (
              <ProductRow key={product.id} product={product} onDelete={handleDeleteProduct} onToggle={handleToggleAvailable} onImageUpload={handleImageUpload} uploading={uploading} fileRef={(el) => { fileRefs.current[product.id] = el; }} />
            ))}
          </div>
        </div>
      )}

      {/* Add product */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Agregar producto / servicio</h2>
        <form onSubmit={handleAddProduct} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Nombre *" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} required />
            <Input placeholder="Precio (ej: 8500)" type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} />
          </div>
          <Input placeholder="Descripción breve" value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newProduct.sectionId}
              onChange={(e) => setNewProduct((p) => ({ ...p, sectionId: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Sin sección</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Input placeholder="URL imagen (opcional)" value={newProduct.image} onChange={(e) => setNewProduct((p) => ({ ...p, image: e.target.value }))} />
          </div>
          <Button type="submit" disabled={addingProduct || !newProduct.name} size="sm" className="w-full">
            <Plus className="h-4 w-4" />
            {addingProduct ? "Agregando..." : "Agregar al catálogo"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ProductRow({ product, onDelete, onToggle, onImageUpload, uploading, fileRef }: {
  product: Product;
  onDelete: (id: string) => void;
  onToggle: (p: Product) => void;
  onImageUpload: (id: string, file: File) => void;
  uploading: string | null;
  fileRef: (el: HTMLInputElement | null) => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!product.available ? "opacity-50" : ""}`}>
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative flex items-center justify-center cursor-pointer"
        onClick={() => {
          const input = document.getElementById(`img-${product.id}`) as HTMLInputElement;
          input?.click();
        }}
      >
        {product.image
          ? <Image src={product.image} alt={product.name} fill className="object-cover" />
          : <ImageIcon className="h-4 w-4 text-gray-300" />}
        {uploading === product.id && <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-gray-500">...</div>}
      </div>
      <input
        id={`img-${product.id}`}
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageUpload(product.id, f); }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
        {product.description && <p className="text-xs text-gray-400 truncate">{product.description}</p>}
      </div>
      {product.price != null && (
        <span className="text-sm font-bold text-emerald-700 shrink-0">${product.price.toLocaleString("es-CL")}</span>
      )}
      <button onClick={() => onToggle(product)} className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors shrink-0 ${product.available ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"}`}>
        {product.available ? "Disponible" : "No disp."}
      </button>
      <button onClick={() => onDelete(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 shrink-0">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
