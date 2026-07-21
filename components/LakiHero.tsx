"use client";
import { useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const TIPOS = [
  { value: "pareja",  label: "👫 Pareja" },
  { value: "familia", label: "👨‍👩‍👧 Familia" },
  { value: "amigos",  label: "🍻 Amigos" },
  { value: "solo",    label: "🧭 Solo" },
];

const DIAS = [
  { value: "1", label: "1 día" },
  { value: "2", label: "2 días" },
  { value: "3", label: "3 días" },
  { value: "4+", label: "4+ días" },
];

export function LakiHero() {
  const [tipo, setTipo] = useState("");
  const [dias, setDias] = useState("");
  const router = useRouter();

  function handleGo() {
    const p = new URLSearchParams();
    if (tipo) p.set("tipo", tipo);
    if (dias) p.set("dias", dias);
    router.push(`/panorama${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-7 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Laki — Tu asistente local</span>
        </div>

        <p className="text-white font-semibold text-sm mb-3">¿Con quién vas?</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTipo(prev => prev === t.value ? "" : t.value)}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border text-xs font-medium transition-all ${
                tipo === t.value
                  ? "bg-amber-400 text-gray-900 border-amber-400"
                  : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              <span className="text-xl">{t.label.split(" ")[0]}</span>
              <span>{t.label.split(" ").slice(1).join(" ")}</span>
            </button>
          ))}
        </div>

        <p className="text-white font-semibold text-sm mb-3">¿Cuántos días?</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {DIAS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDias(prev => prev === d.value ? "" : d.value)}
              className={`py-2.5 rounded-2xl border text-xs font-medium transition-all ${
                dias === d.value
                  ? "bg-amber-400 text-gray-900 border-amber-400"
                  : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGo}
          className="w-full bg-amber-400 hover:bg-amber-300 text-gray-900 font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Armar mi panorama
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Trust line */}
      <p className="text-center text-white/40 text-xs mt-4">
        Gratis · Lugares reales · Personalizado
      </p>
    </div>
  );
}
