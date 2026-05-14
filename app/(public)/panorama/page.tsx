"use client";
import { useState } from "react";
import { Sparkles, MapPin, Clock, ChevronRight, RotateCcw, Share2, ExternalLink, Cloud, Sun, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CITIES, CATEGORIES } from "@/lib/constants";

const TIPOS = [
  { value: "pareja", label: "👫 Pareja" },
  { value: "familia", label: "👨‍👩‍👧 Familia" },
  { value: "amigos", label: "🍻 Amigos" },
  { value: "solo", label: "🧭 Solo" },
];
const PRESUPUESTOS = [
  { value: "bajo", label: "$ Económico" },
  { value: "medio", label: "$$ Moderado" },
  { value: "alto", label: "$$$ Sin límite" },
];
const DURACIONES = [
  { value: "mañana", label: "🌅 Solo la mañana" },
  { value: "tarde", label: "🌇 Solo la tarde" },
  { value: "dia_completo", label: "☀️ Día completo" },
];
const CLIMAS = [
  { value: "soleado", label: "☀️ Soleado", icon: Sun },
  { value: "parcial", label: "⛅ Parcialmente nublado", icon: Cloud },
  { value: "lluvioso", label: "🌧️ Lluvioso", icon: CloudRain },
];
const EXTRA_INTERESES = [
  { slug: "deportes", name: "🏄 Deportes" },
];

interface PanoramaItem {
  hora: string;
  lugar: string;
  categoria: string;
  descripcion: string;
  tip?: string;
}
interface Panorama {
  titulo: string;
  descripcion: string;
  items: PanoramaItem[];
  consejos: string[];
  businessLinks: Record<string, string>;
  businessCoords: Record<string, { lat: number; lng: number }>;
}

export default function PanoramaPage() {
  const [ciudad, setCiudad] = useState("");
  const [tipo, setTipo] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [duracion, setDuracion] = useState("");
  const [clima, setClima] = useState("");
  const [intereses, setIntereses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [panorama, setPanorama] = useState<Panorama | null>(null);
  const [error, setError] = useState("");

  function toggleInteres(slug: string) {
    setIntereses((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  async function handleGenerar() {
    if (!ciudad || !tipo || !presupuesto || !duracion) {
      setError("Completa todos los campos para continuar");
      return;
    }
    setError("");
    setLoading(true);
    setPanorama(null);
    try {
      const res = await fetch("/api/panorama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciudad, tipo, presupuesto, duracion, clima, intereses }),
      });
      let data: { error?: string } & Panorama | null = null;
      try { data = await res.json(); } catch { /* non-json response */ }
      if (!res.ok || !data) throw new Error(data?.error ?? `Error del servidor (${res.status})`);
      setPanorama(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const allIntereses = [...CATEGORIES, ...EXTRA_INTERESES];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-950 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-sm font-medium text-amber-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Laki — Tu asistente de la cuenca
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">¿Qué panorama buscas hoy?</h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            Cuéntale a Laki qué quieres y arma un itinerario con lugares reales de la zona.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {!panorama ? (
          <>
            {/* Ciudad */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> ¿En qué ciudad?
              </p>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCiudad(c.slug)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      ciudad === c.slug
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clima */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">¿Cómo está el clima? <span className="text-gray-400 font-normal">(opcional)</span></p>
              <div className="flex flex-wrap gap-2">
                {CLIMAS.map((cl) => (
                  <button
                    key={cl.value}
                    onClick={() => setClima(prev => prev === cl.value ? "" : cl.value)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      clima === cl.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {cl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de grupo */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">¿Con quién vas?</p>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTipo(t.value)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      tipo === t.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presupuesto */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">¿Cuál es tu presupuesto?</p>
              <div className="flex flex-wrap gap-2">
                {PRESUPUESTOS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPresupuesto(p.value)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      presupuesto === p.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duración */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" /> ¿Cuánto tiempo tienes?
              </p>
              <div className="flex flex-wrap gap-2">
                {DURACIONES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuracion(d.value)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      duracion === d.value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intereses */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">¿Qué te interesa? <span className="text-gray-400 font-normal">(opcional)</span></p>
              <p className="text-xs text-gray-400 mb-3">Puedes elegir varios</p>
              <div className="flex flex-wrap gap-2">
                {allIntereses.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => toggleInteres(cat.slug)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      intereses.includes(cat.slug)
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button onClick={handleGenerar} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Laki está armando tu panorama...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Preguntarle a Laki
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gray-900 text-white rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Panorama de Laki
              </div>
              <h2 className="text-2xl font-black mb-2">{panorama.titulo}</h2>
              <p className="text-white/60 text-sm leading-relaxed">{panorama.descripcion}</p>
            </div>

            {/* Mapa y ruta */}
            {(() => {
              const routePoints = panorama.items
                .map((item) => panorama.businessCoords?.[item.lugar.toLowerCase()])
                .filter(Boolean) as { lat: number; lng: number }[];
              const mapsUrl = routePoints.length >= 2
                ? `https://www.google.com/maps/dir/${routePoints.map((p) => `${p.lat},${p.lng}`).join("/")}`
                : routePoints.length === 1
                ? `https://www.google.com/maps/search/?api=1&query=${routePoints[0].lat},${routePoints[0].lng}`
                : null;
              const embedCenter = routePoints[0] ?? null;

              if (!mapsUrl) return null;
              return (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {embedCenter && (
                    <div className="h-48">
                      <iframe
                        src={`https://maps.google.com/maps?q=${embedCenter.lat},${embedCenter.lng}&z=14&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa del itinerario"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                      <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors">
                        <MapPin className="h-4 w-4" />
                        {routePoints.length >= 2 ? `Ver ruta completa (${routePoints.length} paradas)` : "Ver en Google Maps"}
                      </button>
                    </a>
                  </div>
                </div>
              );
            })()}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Tu itinerario</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {panorama.items.map((item, i: number) => {
                  const slug = panorama.businessLinks?.[item.lugar.toLowerCase()];
                  return (
                    <div key={i} className="flex gap-4 p-5">
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-mono font-semibold text-emerald-600">{item.hora}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {slug ? (
                            <Link
                              href={`/directory/${slug}`}
                              className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 transition-colors"
                            >
                              {item.lugar}
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </Link>
                          ) : (
                            <p className="font-semibold text-gray-900">{item.lugar}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.categoria}</p>
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{item.descripcion}</p>
                        {item.tip && (
                          <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-1.5">
                            💡 {item.tip}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {panorama.consejos?.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <h3 className="font-semibold text-emerald-900 mb-3 text-sm">Consejos locales</h3>
                <ul className="space-y-2">
                  {panorama.consejos.map((c: string, i: number) => (
                    <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPanorama(null)}>
                <RotateCcw className="h-4 w-4" />
                Nuevo panorama
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: panorama.titulo, text: panorama.descripcion, url: window.location.href });
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
