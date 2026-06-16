"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Ticket, Copy, Check } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  usedCount: number;
  validFrom?: string | null;
  validTo?: string | null;
  active: boolean;
  createdAt: string;
}

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function discountLabel(c: Coupon) {
  return c.discountType === "PERCENT" ? `${c.discountValue}% OFF` : `$${c.discountValue.toLocaleString("es-CL")} OFF`;
}

export default function CouponsAdminPage() {
  const params = useParams();
  const id = params.id as string;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: randomCode(),
    title: "",
    description: "",
    discountType: "PERCENT",
    discountValue: "",
    minPurchase: "",
    maxUses: "",
    validTo: "",
  });

  useEffect(() => {
    fetch(`/api/admin/businesses/${id}/coupons`)
      .then((r) => r.json())
      .then(setCoupons)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    const res = await fetch(`/api/admin/businesses/${id}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const c = await res.json();
      setCoupons((prev) => [c, ...prev]);
      setForm({ code: randomCode(), title: "", description: "", discountType: "PERCENT", discountValue: "", minPurchase: "", maxUses: "", validTo: "" });
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al crear cupón");
    }
    setAdding(false);
  }

  async function handleToggle(coupon: Coupon) {
    const res = await fetch(`/api/admin/businesses/${id}/coupons`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponId: coupon.id, active: !coupon.active }),
    });
    if (res.ok) setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, active: !c.active } : c));
  }

  async function handleDelete(couponId: string) {
    await fetch(`/api/admin/businesses/${id}/coupons`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponId }),
    });
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  const active = coupons.filter((c) => c.active);
  const inactive = coupons.filter((c) => !c.active);

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/businesses/${id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Cupones de descuento</h1>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Nuevo cupón</h2>
        {error && <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Código</label>
              <div className="flex gap-1">
                <Input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  required
                  className="font-mono tracking-widest uppercase"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, code: randomCode() }))}
                  className="shrink-0 px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
                >
                  ↺
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo de descuento</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white"
              >
                <option value="PERCENT">Porcentaje (%)</option>
                <option value="FIXED">Monto fijo ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {form.discountType === "PERCENT" ? "Descuento (%)" : "Descuento ($)"}
              </label>
              <Input
                type="number"
                min="1"
                max={form.discountType === "PERCENT" ? "100" : undefined}
                step="0.01"
                placeholder={form.discountType === "PERCENT" ? "ej: 20" : "ej: 5000"}
                value={form.discountValue}
                onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Compra mínima (opcional)</label>
              <Input
                type="number"
                min="0"
                placeholder="ej: 10000"
                value={form.minPurchase}
                onChange={(e) => setForm((p) => ({ ...p, minPurchase: e.target.value }))}
              />
            </div>
          </div>

          <Input
            placeholder="Título * (ej: 20% en tu primer pedido)"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <Input
            placeholder="Descripción (ej: Válido de lunes a viernes, no acumulable)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Usos máximos (opcional)</label>
              <Input
                type="number"
                min="1"
                placeholder="ej: 50"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Válido hasta (opcional)</label>
              <Input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))}
              />
            </div>
          </div>

          <Button type="submit" disabled={adding || !form.title || !form.discountValue} size="sm" className="w-full gap-1.5">
            <Plus className="h-4 w-4" />
            {adding ? "Creando..." : "Crear cupón"}
          </Button>
        </form>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Activos ({active.length})</p>
          <div className="space-y-2">
            {active.map((c) => <CouponRow key={c.id} coupon={c} discountLabel={discountLabel(c)} onToggle={handleToggle} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pausados ({inactive.length})</p>
          <div className="space-y-2 opacity-60">
            {inactive.map((c) => <CouponRow key={c.id} coupon={c} discountLabel={discountLabel(c)} onToggle={handleToggle} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {coupons.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Ticket className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin cupones creados aún</p>
        </div>
      )}
    </div>
  );
}

function CouponRow({
  coupon, discountLabel, onToggle, onDelete,
}: {
  coupon: Coupon;
  discountLabel: string;
  onToggle: (c: Coupon) => void;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const expired = coupon.validTo && new Date(coupon.validTo) < new Date();
  const exhausted = coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;

  function copy() {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3">
      <div className="shrink-0 mt-0.5">
        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg">
          {discountLabel}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono font-bold text-sm text-gray-800 tracking-wider">{coupon.code}</span>
          <button onClick={copy} className="text-gray-400 hover:text-gray-600">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="text-xs font-medium text-gray-700">{coupon.title}</p>
        {coupon.description && <p className="text-xs text-gray-400 mt-0.5">{coupon.description}</p>}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {coupon.minPurchase && (
            <span className="text-xs text-gray-400">Compra mín. ${coupon.minPurchase.toLocaleString("es-CL")}</span>
          )}
          {coupon.maxUses && (
            <span className={`text-xs font-medium ${exhausted ? "text-red-500" : "text-gray-400"}`}>
              {coupon.usedCount}/{coupon.maxUses} usos
            </span>
          )}
          {!coupon.maxUses && coupon.usedCount > 0 && (
            <span className="text-xs text-gray-400">{coupon.usedCount} usos</span>
          )}
          {coupon.validTo && (
            <span className={`text-xs font-medium ${expired ? "text-red-500" : "text-gray-400"}`}>
              {expired ? "Expiró" : "Válido hasta"} {new Date(coupon.validTo).toLocaleDateString("es-CL")}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggle(coupon)}
          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${coupon.active ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"}`}
        >
          {coupon.active ? "Activo" : "Pausado"}
        </button>
        <button onClick={() => onDelete(coupon.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
