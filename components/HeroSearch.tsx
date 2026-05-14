"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { CITIES, CATEGORIES } from "@/lib/constants";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    // Si hay texto, dejar que Laki interprete la búsqueda
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
        if (filters.ciudad) params.set("ciudad", filters.ciudad);
        if (filters.categoria) params.set("categoria", filters.categoria);
        if (filters.priceRange) params.set("precio", filters.priceRange);
        if (ciudad) params.set("ciudad", ciudad); // manual override
        if (categoria) params.set("categoria", categoria);
        params.set("q", q);
        router.push(`/directory?${params.toString()}`);
      } catch {
        const params = new URLSearchParams({ q });
        if (ciudad) params.set("ciudad", ciudad);
        if (categoria) params.set("categoria", categoria);
        router.push(`/directory?${params.toString()}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sin texto: filtros manuales normales
    const params = new URLSearchParams();
    if (ciudad) params.set("ciudad", ciudad);
    if (categoria) params.set("categoria", categoria);
    router.push(`/directory${params.toString() ? `?${params}` : ""}`);
  }

  const QUICK = ["Restaurantes", "Hoteles", "Cafés", "Actividades", "Bares"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
          {/* What */}
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
          </div>

          {/* Where */}
          <div className="relative flex items-center gap-2 px-4 py-3 sm:w-40 bg-gray-50 rounded-xl">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <select
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer appearance-none font-medium pr-4 min-w-0"
            >
              <option value="">Ciudad</option>
              {CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Category */}
          <div className="relative flex items-center gap-2 px-4 py-3 sm:w-36 bg-gray-50 rounded-xl">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer appearance-none font-medium pr-4 min-w-0"
            >
              <option value="">Categoría</option>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-70 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>{loading ? "Buscando..." : "Buscar"}</span>
          </button>
        </div>

        {/* Hint */}
        {!q && (
          <p className="text-xs text-white/40 text-center mt-2">
            Prueba: <span className="text-white/60 italic">"algo romántico para cenar en Puerto Varas"</span>
          </p>
        )}
      </form>

      {/* Quick search chips */}
      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
        <span className="text-xs text-white/40">Popular:</span>
        {QUICK.map(label => {
          const cat = CATEGORIES.find(c => c.name === label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => router.push(`/directory?categoria=${cat?.slug ?? ""}`)}
              className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full transition-all"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
