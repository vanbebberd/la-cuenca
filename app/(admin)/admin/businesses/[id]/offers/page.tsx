"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Tag } from "lucide-react";

interface Offer { id: string; title: string; description?: string | null; badge?: string | null; validTo?: string | null; active: boolean; createdAt: string; }

export default function OffersAdminPage() {
  const params = useParams();
  const id = params.id as string;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", badge: "", validTo: "" });

  useEffect(() => {
    fetch(`/api/admin/businesses/${id}/offers`)
      .then((r) => r.json())
      .then(setOffers)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch(`/api/admin/businesses/${id}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { const o = await res.json(); setOffers((prev) => [o, ...prev]); setForm({ title: "", description: "", badge: "", validTo: "" }); }
    setAdding(false);
  }

  async function handleToggle(offer: Offer) {
    const res = await fetch(`/api/admin/businesses/${id}/offers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId: offer.id, active: !offer.active }),
    });
    if (res.ok) setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, active: !o.active } : o));
  }

  async function handleDelete(offerId: string) {
    await fetch(`/api/admin/businesses/${id}/offers`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId }),
    });
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  const activeOffers = offers.filter((o) => o.active);
  const inactiveOffers = offers.filter((o) => !o.active);

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/businesses/${id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Ofertas y promociones</h1>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Nueva oferta</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Título * (ej: 2x1 en cenas)"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <Input
              placeholder="Badge (ej: 2x1, 20% OFF, GRATIS)"
              value={form.badge}
              onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Descripción (ej: Válido de lunes a miércoles en cenas)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Válida hasta (opcional)</label>
            <Input
              type="date"
              value={form.validTo}
              onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={adding || !form.title} size="sm" className="w-full">
            <Plus className="h-4 w-4" />
            {adding ? "Publicando..." : "Publicar oferta"}
          </Button>
        </form>
      </div>

      {/* Active offers */}
      {activeOffers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Activas ({activeOffers.length})</p>
          <div className="space-y-2">
            {activeOffers.map((offer) => <OfferRow key={offer.id} offer={offer} onToggle={handleToggle} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {/* Inactive */}
      {inactiveOffers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pausadas ({inactiveOffers.length})</p>
          <div className="space-y-2 opacity-60">
            {inactiveOffers.map((offer) => <OfferRow key={offer.id} offer={offer} onToggle={handleToggle} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {offers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin ofertas publicadas aún</p>
        </div>
      )}
    </div>
  );
}

function OfferRow({ offer, onToggle, onDelete }: { offer: Offer; onToggle: (o: Offer) => void; onDelete: (id: string) => void; }) {
  const expired = offer.validTo && new Date(offer.validTo) < new Date();
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3">
      {offer.badge && (
        <span className="shrink-0 text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-1 rounded-lg mt-0.5">{offer.badge}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{offer.title}</p>
        {offer.description && <p className="text-xs text-gray-500 mt-0.5">{offer.description}</p>}
        {offer.validTo && (
          <p className={`text-xs mt-1 font-medium ${expired ? "text-red-500" : "text-gray-400"}`}>
            {expired ? "Expiró" : "Válida hasta"} {new Date(offer.validTo).toLocaleDateString("es-CL")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggle(offer)}
          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${offer.active ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"}`}
        >
          {offer.active ? "Activa" : "Pausada"}
        </button>
        <button onClick={() => onDelete(offer.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
