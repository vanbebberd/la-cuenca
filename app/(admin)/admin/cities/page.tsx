"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface City {
  id: string;
  name: string;
  slug: string;
  lat?: number | null;
  lng?: number | null;
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta ciudad?")) return;
    await fetch(`/api/admin/cities/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Ciudades</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700 text-sm">Nueva ciudad</h2>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Osorno" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Latitud (GPS)</label>
            <Input value={lat} onChange={e => setLat(e.target.value)} placeholder="-40.5735" type="number" step="0.0001" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Longitud (GPS)</label>
            <Input value={lng} onChange={e => setLng(e.target.value)} placeholder="-73.1352" type="number" step="0.0001" />
          </div>
        </div>
        <p className="text-xs text-gray-400">💡 Para obtener lat/lng: abre Google Maps, click derecho en la ciudad → copiar coordenadas</p>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <Button type="submit" disabled={loading} size="sm">
          <Plus className="h-4 w-4" />
          {loading ? "Creando..." : "Agregar ciudad"}
        </Button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ciudad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Coordenadas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cities.map(city => (
              <tr key={city.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{city.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{city.slug}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {city.lat && city.lng ? `${city.lat}, ${city.lng}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(city.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
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
