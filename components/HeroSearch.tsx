"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { CITIES, CATEGORIES } from "@/lib/constants";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (q.trim()) {
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q }),
        });
        const filters = await res.json();
        const params = new URLSearchParams();
        // Usar ciudad manual si se seleccionó, si no usar la extraída por la IA
        const finalCiudad = ciudad || filters.ciudad;
        const finalCat = categoria || filters.categoria;
        if (finalCiudad) params.set("ciudad", finalCiudad);
        if (finalCat) params.set("categoria", finalCat);
        if (filters.priceRange) params.set("precio", filters.priceRange);
        // Solo pasar q si la IA no encontró nada (búsqueda por texto como fallback)
        if (!filters.ciudad && !filters.categoria && !filters.priceRange) {
          params.set("q", q);
        }
        router.push(`/directory?${params.toString()}`);
      } catch {
        const params = new URLSearchParams();
        if (ciudad) params.set("ciudad", ciudad);
        if (categoria) params.set("categoria", categoria);
        params.set("q", q);
        router.push(`/directory?${params.toString()}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    const params = new URLSearchParams();
    if (ciudad) params.set("ciudad", ciudad);
    if (categoria) params.set("categoria", categoria);
    router.push(`/directory${params.toString() ? `?${params}` : ""}`);
  }

  const QUICK = ["Restaurantes", "Hoteles", "Cafés", "Actividades", "Bares"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex gap-2">
          <div className="flex items-center gap-3 px-4 py-3 flex-1 bg-gray-50 rounded-xl">
            {loading
              ? <Loader2 className="h-4 w-4 text-emerald-500 shrink-0 animate-spin" />
              : <Search className="h-4 w-4 text-gray-400 shrink-0" />
            }
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="¿Qué buscas? Escríbelo como quieras..."
              className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
            />
            {q && (
              <span className="flex items-center gap-1 text-xs text-amber-400 shrink-0">
                <Sparkles className="h-3 w-3" /> Laki
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="hidden sm:inline">{loading ? "Buscando..." : "Buscar"}</span>
          </button>
        </div>

        {/* Ciudad pills */}
        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setCiudad("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
              !ciudad
                ? "bg-white text-gray-900 border-white"
                : "bg-white/10 text-white/60 border-white/20 hover:bg-white/20 hover:text-white"
            }`}
          >
            Toda la cuenca
          </button>
          {CITIES.map(c => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCiudad(c.slug === ciudad ? "" : c.slug)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                ciudad === c.slug
                  ? "bg-white text-gray-900 border-white"
                  : "bg-white/10 text-white/60 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Categoría quick chips */}
        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
          <span className="text-xs text-white/30">Popular:</span>
          {QUICK.map(label => {
            const cat = CATEGORIES.find(c => c.name === label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => setCategoria(cat?.slug ?? "")}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  categoria === cat?.slug
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white/10 text-white/60 border-white/15 hover:bg-white/20 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </form>
    </div>
  );
}
