import { prisma } from "@/lib/prisma";
import { BusinessCard } from "@/components/BusinessCard";
import { CITIES, CATEGORIES, PRICE_RANGES } from "@/lib/constants";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Directorio" };

interface DirectoryPageProps {
  searchParams: Promise<{ ciudad?: string; categoria?: string; precio?: string; q?: string }>;
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const { ciudad, categoria, precio, q } = params;

  const businesses = await prisma.business.findMany({
    where: {
      status: "ACTIVE",
      ...(ciudad && { city: { slug: ciudad } }),
      ...(categoria && { category: { slug: categoria } }),
      ...(precio && { priceRange: precio as "BUDGET" | "MODERATE" | "EXPENSIVE" | "LUXURY" }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: { category: true, city: true, hours: true },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: 60,
  });

  const activeCity = CITIES.find((c) => c.slug === ciudad);
  const activeCat = CATEGORIES.find((c) => c.slug === categoria);
  const activePrecio = PRICE_RANGES.find((p) => p.value === precio);

  const hasFilters = !!(ciudad || categoria || precio || q);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeCat ? activeCat.name : activeCity ? `Directorio — ${activeCity.name}` : "Directorio completo"}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{businesses.length}</span>{" "}
              resultado{businesses.length !== 1 ? "s" : ""}
              {activeCity ? ` en ${activeCity.name}` : " en toda la cuenca"}
            </p>
            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                {ciudad && activeCity && (
                  <Link href={buildUrl({ categoria, precio, q })} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-emerald-200 transition-colors">
                    {activeCity.name} <X className="h-3 w-3" />
                  </Link>
                )}
                {categoria && activeCat && (
                  <Link href={buildUrl({ ciudad, precio, q })} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-emerald-200 transition-colors">
                    {activeCat.name} <X className="h-3 w-3" />
                  </Link>
                )}
                {precio && activePrecio && (
                  <Link href={buildUrl({ ciudad, categoria, q })} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-emerald-200 transition-colors">
                    {activePrecio.description} <X className="h-3 w-3" />
                  </Link>
                )}
                {q && (
                  <Link href={buildUrl({ ciudad, categoria, precio })} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-emerald-200 transition-colors">
                    &quot;{q}&quot; <X className="h-3 w-3" />
                  </Link>
                )}
                <Link href="/directory" className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
                  Limpiar filtros
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6 sticky top-24">

              {/* Search */}
              <div>
                <form method="GET">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="Buscar local..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                    />
                    {ciudad && <input type="hidden" name="ciudad" value={ciudad} />}
                    {categoria && <input type="hidden" name="categoria" value={categoria} />}
                    {precio && <input type="hidden" name="precio" value={precio} />}
                  </div>
                </form>
              </div>

              {/* Cities */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Ciudad
                </p>
                <div className="space-y-0.5">
                  <FilterLink href={buildUrl({ categoria, precio, q })} active={!ciudad} label="Todas las ciudades" />
                  {CITIES.map((c) => (
                    <FilterLink key={c.slug} href={buildUrl({ ciudad: c.slug, categoria, precio, q })} active={ciudad === c.slug} label={c.name} />
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categoría</p>
                <div className="space-y-0.5">
                  <FilterLink href={buildUrl({ ciudad, precio, q })} active={!categoria} label="Todas las categorías" />
                  {CATEGORIES.map((cat) => (
                    <FilterLink key={cat.slug} href={buildUrl({ ciudad, categoria: cat.slug, precio, q })} active={categoria === cat.slug} label={cat.name} />
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Precio</p>
                <div className="space-y-0.5">
                  <FilterLink href={buildUrl({ ciudad, categoria, q })} active={!precio} label="Cualquier precio" />
                  {PRICE_RANGES.map((p) => (
                    <FilterLink
                      key={p.value}
                      href={buildUrl({ ciudad, categoria, precio: p.value, q })}
                      active={precio === p.value}
                      label={p.description}
                      badge={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {businesses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 text-center py-20 px-6">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-gray-800 mb-1">Sin resultados</p>
                <p className="text-gray-400 text-sm mb-4">No encontramos locales con esos filtros.</p>
                <Link href="/directory" className="text-sm text-emerald-600 font-medium hover:underline">
                  Ver todo el directorio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {businesses.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterLink({ href, active, label, badge }: { href: string; active: boolean; label: string; badge?: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span>{label}</span>
      {badge && <span className="text-xs font-mono text-gray-400">{badge}</span>}
    </Link>
  );
}

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return `/directory${qs ? `?${qs}` : ""}`;
}
