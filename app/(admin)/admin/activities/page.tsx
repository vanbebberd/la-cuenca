"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users, CalendarDays, Edit, Mountain, Compass, Bike, Waves, Wind, Fish, Leaf, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { ACTIVITY_CATEGORIES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  tour: Compass, hike: Mountain, bike: Bike, kayak: Waves,
  horseback: Wind, fishing: Fish, climbing: Mountain,
  paragliding: Wind, rafting: Waves, other: Leaf,
};

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  ACTIVE:   { label: "Activa",   class: "bg-emerald-50 text-emerald-700" },
  INACTIVE: { label: "Inactiva", class: "bg-gray-100 text-gray-500" },
  DRAFT:    { label: "Borrador", class: "bg-amber-50 text-amber-700" },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/activities");
    setActivities(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(id: string, current: string) {
    const next = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch(`/api/admin/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setActivities((prev) => prev.map((a) => a.id === id ? { ...a, status: next } : a));
    }
  }

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Actividades Outdoor</h1>
          <p className="text-sm text-gray-400">{activities.length} actividad{activities.length !== 1 ? "es" : ""}</p>
        </div>
        <Link href="/admin/activities/new">
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Nueva actividad</Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Mountain className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Sin actividades aún</p>
          <Link href="/admin/activities/new" className="mt-4 inline-block">
            <Button size="sm">Crear primera actividad</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => {
            const cat = ACTIVITY_CATEGORIES.find((c) => c.id === a.category);
            const Icon = ACTIVITY_ICONS[a.category] ?? Leaf;
            const s = STATUS_LABELS[a.status] ?? STATUS_LABELS.DRAFT;
            const isActive = a.status === "ACTIVE";
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.class}`}>{s.label}</span>
                    {a.featured && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Destacada</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.city?.name}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{a._count?.sessions ?? 0} sesiones</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />hasta {a.maxParticipants} pers.</span>
                    <span>{formatPrice(a.pricePerPerson)}/pers.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline" size="sm"
                    className={`gap-1.5 text-xs ${isActive ? "text-gray-500" : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"}`}
                    onClick={() => toggleStatus(a.id, a.status)}
                  >
                    {isActive ? <><EyeOff className="h-3.5 w-3.5" />Desactivar</> : <><Eye className="h-3.5 w-3.5" />Activar</>}
                  </Button>
                  <Link href={`/admin/activities/${a.id}/sessions`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <CalendarDays className="h-3.5 w-3.5" />Sesiones
                    </Button>
                  </Link>
                  <Link href={`/admin/activities/${a.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Edit className="h-3.5 w-3.5" />Editar
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
