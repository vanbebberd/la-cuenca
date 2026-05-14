"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Sparkles } from "lucide-react";
import { CITIES, CATEGORIES } from "@/lib/constants";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [categoria, setCategoria] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (ciudad) params.set("ciudad", ciudad);
    if (categoria) params.set("categoria", categoria);
    router.push(`/directory${params.toString() ? `?${params}` : ""}`);
  }

  const QUICK = ["Restaurantes", "Hoteles", "Cafés", "Actividades", "Bares"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="bg-white rounded-2xl shadow-2xl">
          <div className="flex flex-col sm:flex-row overflow-hidden rounded-2xl">
            {/* What */}
            <div className="flex items-center gap-3 px-5 py-4 flex-1 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
              />
            </div>

            {/* Where */}
            <div className="relative flex items-center gap-3 px-5 py-4 sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-100 group cursor-pointer">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <select
                value={ciudad}
                onChange={e => setCiudad(e.target.value)}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer appearance-none pr-4 font-medium"
              >
                <option value="">Toda la cuenca</option>
                {CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-3 pointer-events-none" />
            </div>

            {/* Category */}
            <div className="relative flex items-center gap-3 px-5 py-4 sm:w-40 border-b sm:border-b-0 sm:border-r border-gray-100 cursor-pointer">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer appearance-none pr-4 font-medium"
              >
                <option value="">Categoría</option>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-3 pointer-events-none" />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-8 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 sm:rounded-none rounded-b-2xl"
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick search chips */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        <span className="text-xs text-white/50">Popular:</span>
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
