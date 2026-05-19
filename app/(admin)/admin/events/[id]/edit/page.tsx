"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface TicketType { id: string; name: string; description?: string | null; price: number; capacity: number; sold: number; }
interface City { id: string; name: string; slug: string; }

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [newTicket, setNewTicket] = useState({ name: "", description: "", price: "", capacity: "" });
  const [addingTicket, setAddingTicket] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", citySlug: "", location: "",
    startDate: "", endDate: "", image: "", published: false, featured: false,
  });

  useEffect(() => {
    fetch("/api/admin/cities").then(r => r.json()).then(setCities);
    if (!isNew) {
      fetch(`/api/admin/events/${id}`).then(r => r.json()).then((e) => {
        setForm({
          title: e.title ?? "",
          description: e.description ?? "",
          citySlug: e.city?.slug ?? "",
          location: e.location ?? "",
          startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 16) : "",
          endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 16) : "",
          image: e.image ?? "",
          published: e.published ?? false,
          featured: e.featured ?? false,
        });
        setTicketTypes(e.ticketTypes ?? []);
        setSavedId(e.id);
        setLoading(false);
      });
    }
  }, [id, isNew]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isNew ? "/api/admin/events" : `/api/admin/events/${id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al guardar");
      const data = await res.json();
      if (isNew) {
        setSavedId(data.id);
        router.replace(`/admin/events/${data.id}/edit`);
      } else {
        router.push("/admin/events");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTicket(e: React.FormEvent) {
    e.preventDefault();
    const eventId = savedId ?? id;
    if (!eventId || eventId === "new") { setError("Guarda el evento primero"); return; }
    setAddingTicket(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/ticket-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });
      if (!res.ok) throw new Error();
      const tt = await res.json();
      setTicketTypes(prev => [...prev, tt]);
      setNewTicket({ name: "", description: "", price: "", capacity: "" });
    } catch {
      setError("Error creando ticket");
    } finally {
      setAddingTicket(false);
    }
  }

  async function handleDeleteTicket(ttId: string) {
    const eventId = savedId ?? id;
    await fetch(`/api/admin/events/${eventId}/ticket-types`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketTypeId: ttId }),
    });
    setTicketTypes(prev => prev.filter(t => t.id !== ttId));
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/events">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{isNew ? "Nuevo evento" : "Editar evento"}</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Información</h2>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Título *</label>
          <Input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ciudad *</label>
            <select name="citySlug" value={form.citySlug} onChange={handleChange} required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Seleccionar</option>
              {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Lugar / Dirección</label>
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Teatro, plaza..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha inicio *</label>
            <Input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha fin</label>
            <Input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">URL imagen</label>
          <Input name="image" type="url" value={form.image} onChange={handleChange} placeholder="https://..." />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="rounded accent-emerald-600" />
            Publicado
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="rounded accent-amber-500" />
            ⭐ Destacado
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Guardando..." : isNew ? "Crear evento" : "Guardar cambios"}
        </Button>
      </form>

      {/* Ticket types */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Tipos de ticket</h2>
        {isNew && !savedId && (
          <p className="text-sm text-gray-400">Guarda el evento primero para agregar tickets.</p>
        )}

        {ticketTypes.length > 0 && (
          <div className="space-y-2">
            {ticketTypes.map(tt => (
              <div key={tt.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{tt.name}</p>
                  <p className="text-xs text-gray-400">${tt.price.toLocaleString()} · {tt.sold}/{tt.capacity} vendidos</p>
                </div>
                <button onClick={() => handleDeleteTicket(tt.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {(savedId || !isNew) && (
          <form onSubmit={handleAddTicket} className="space-y-3 border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500">Agregar tipo de ticket</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Nombre (ej: General)" value={newTicket.name} onChange={e => setNewTicket(p => ({ ...p, name: e.target.value }))} required />
              <Input placeholder="Descripción (opcional)" value={newTicket.description} onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))} />
              <Input placeholder="Precio ($)" type="number" min="0" value={newTicket.price} onChange={e => setNewTicket(p => ({ ...p, price: e.target.value }))} required />
              <Input placeholder="Capacidad" type="number" min="1" value={newTicket.capacity} onChange={e => setNewTicket(p => ({ ...p, capacity: e.target.value }))} required />
            </div>
            <Button type="submit" size="sm" variant="outline" disabled={addingTicket}>
              <Plus className="h-3.5 w-3.5" />
              {addingTicket ? "Agregando..." : "Agregar ticket"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
