"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  order: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#10b981");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, color }),
    });
    if (res.ok) {
      setName(""); setIcon(""); setColor("#10b981");
      setMsg("Categoría creada");
      load();
    } else {
      const err = await res.json();
      setMsg(err.error ?? "Error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Categorías</h1>

      {/* Formulario */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700 text-sm">Nueva categoría</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Spas" required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Icono (lucide-react)</label>
            <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Ej: Heart" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-16 rounded-lg border border-gray-200 cursor-pointer" />
            <span className="text-sm text-gray-500 font-mono">{color}</span>
          </div>
        </div>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <Button type="submit" disabled={loading} size="sm">
          <Plus className="h-4 w-4" />
          {loading ? "Creando..." : "Agregar categoría"}
        </Button>
      </form>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Categoría</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Icono</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Color</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.icon}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-gray-400 font-mono">{cat.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
