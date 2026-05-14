"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  plan: string;
  status: string;
  featured: boolean;
  city: { name: string };
  category: { name: string };
}

const PLAN_CONFIG = {
  FREE:  { label: "Free",  color: "bg-gray-100 text-gray-600",   ring: "ring-gray-200" },
  BASIC: { label: "Basic", color: "bg-blue-100 text-blue-700",   ring: "ring-blue-300" },
  PRO:   { label: "Pro",   color: "bg-amber-100 text-amber-700", ring: "ring-amber-400" },
};

export default function AdminPlanesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/businesses")
      .then((r) => r.json())
      .then((data) => setBusinesses(data))
      .finally(() => setLoading(false));
  }, []);

  async function changePlan(id: string, plan: string) {
    setSaving(id);
    await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, ...(plan !== "PRO" ? { featured: false } : {}) }),
    });
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, plan, featured: plan !== "PRO" ? false : b.featured } : b));
    setSaving(null);
  }

  const grouped = {
    PRO:   businesses.filter((b) => b.plan === "PRO"),
    BASIC: businesses.filter((b) => b.plan === "BASIC"),
    FREE:  businesses.filter((b) => b.plan === "FREE"),
  };

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Planes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{businesses.length} negocios en total</p>
        </div>
        <div className="flex gap-3 text-sm">
          {Object.entries(grouped).map(([plan, list]) => (
            <div key={plan} className={`px-3 py-1.5 rounded-xl font-semibold ${PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG].color}`}>
              {PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG].label}: {list.length}
            </div>
          ))}
        </div>
      </div>

      {(["PRO", "BASIC", "FREE"] as const).map((plan) => (
        <div key={plan}>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan === "PRO" ? "text-amber-600" : plan === "BASIC" ? "text-blue-600" : "text-gray-400"}`}>
            Plan {PLAN_CONFIG[plan].label} — {grouped[plan].length} negocios
          </h2>
          {grouped[plan].length === 0 ? (
            <p className="text-sm text-gray-300 pl-1">Sin negocios en este plan</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {grouped[plan].map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.category.name} · {b.city.name}</p>
                  </div>
                  {b.featured && (
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium shrink-0">
                      ⭐ Destacado
                    </span>
                  )}
                  {/* Quick plan switcher */}
                  <div className="flex gap-1 shrink-0">
                    {(["FREE", "BASIC", "PRO"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => changePlan(b.id, p)}
                        disabled={saving === b.id || b.plan === p}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                          b.plan === p
                            ? PLAN_CONFIG[p].color + " ring-1 " + PLAN_CONFIG[p].ring
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {saving === b.id && b.plan !== p ? "..." : PLAN_CONFIG[p].label}
                      </button>
                    ))}
                  </div>
                  <Link href={`/admin/businesses/${b.id}/edit`} className="text-xs text-gray-400 hover:text-gray-700 shrink-0">
                    Editar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
