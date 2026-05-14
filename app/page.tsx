export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Ticket, Gift, Star, Sparkles,
  Coffee, UtensilsCrossed, BedDouble, Beer, Map,
  Activity, ShoppingBag, Bike, GlassWater, Heart, Wrench, Camera,
  ArrowRight, CheckCircle2,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { HeroSearch } from "@/components/HeroSearch";
import { prisma } from "@/lib/prisma";
import { BusinessCard } from "@/components/BusinessCard";

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Coffee, BedDouble, Beer, Map,
  Activity, ShoppingBag, Bike, GlassWater, Heart, Wrench, Camera,
};

const CITY_PHOTOS: Record<string, string> = {
  "puerto-montt": "https://images.unsplash.com/photo-1553761984-30e1bfcb8bdb?w=600&q=80",
  "puerto-varas": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  "llanquihue":   "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  "frutillar":    "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&q=80",
  "puerto-octay": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  "cochamo":      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
};

export default async function HomePage() {
  const [featured, cities] = await Promise.all([
    prisma.business.findMany({
      where: { featured: true, status: "ACTIVE", plan: "PRO" },
      include: { city: true, category: true },
      orderBy: { avgRating: "desc" },
      take: 8,
    }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative h-[92vh] min-h-[620px] flex flex-col items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=90"
          alt="La Cuenca"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center text-white">
          <p className="text-white/50 text-sm font-medium uppercase tracking-[0.2em] mb-5">
            Puerto Varas · Puerto Montt · Frutillar
          </p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-5">
            Descubre, vive<br />y disfruta<br />
            <span className="text-emerald-400">la cuenca</span>
          </h1>

          <p className="text-white/50 text-base max-w-sm mx-auto mb-10 leading-relaxed">
            Restaurantes, cafeterías, actividades y eventos — todo lo que necesitas, en un solo lugar.
          </p>

          <HeroSearch />
        </div>

      </section>

      {/* ── CATEGORÍAS ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900">Explorar por categoría</h2>
            <Link href="/directory" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors">
              Ver todo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] ?? Map;
              return (
                <Link
                  key={cat.slug}
                  href={`/directory?categoria=${cat.slug}`}
                  className="group flex flex-col items-center gap-2.5 px-3 py-5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
                >
                  <Icon className="h-8 w-8 text-slate-600 group-hover:text-slate-900 transition-colors" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-800 transition-colors text-center leading-tight">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CIUDADES ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Explorar por ciudad</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link key={city.slug} href={`/directory?ciudad=${city.slug}`} className="group block">
                <article className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100/80 bg-white">
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <Image
                      src={city.image ?? CITY_PHOTOS[city.slug] ?? "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80"}
                      alt={city.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="220px"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-3 left-3 text-sm font-black text-white leading-tight">{city.name}</p>
                  </div>
                  {city.description && (
                    <div className="px-3 py-2.5">
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{city.description}</p>
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECOMENDADOS ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-1">Selección de la cuenca</p>
                <h2 className="text-2xl font-black text-gray-900">Recomendados</h2>
              </div>
              <Link href="/directory" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-2">¿Por qué La Cuenca?</p>
            <h2 className="text-4xl font-black text-gray-900">Todo en un solo lugar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Star, label: "Reseñas auténticas",
                desc: "Opiniones reales de la comunidad local y visitantes que conocen la zona.",
                color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100",
              },
              {
                icon: Gift, label: "Puntos y recompensas",
                desc: "Acumula puntos en cada visita y canjéalos por beneficios exclusivos.",
                color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
              },
              {
                icon: Ticket, label: "Tickets online",
                desc: "Compra entradas a eventos, conciertos y ferias en toda la cuenca.",
                color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100",
              },
            ].map(({ icon: Icon, label, desc, color, bg, border }) => (
              <div key={label} className={`rounded-2xl border ${border} ${bg} p-8`}>
                <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAKI ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-950 py-24">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1600&q=80"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-white">
            <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Laki — Tu asistente local
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-[0.95]">
              Tu panorama<br />
              <span className="text-amber-400">perfecto</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm mb-8">
              Pregúntale a Laki qué hacer hoy. Cuéntale con quién vas, el clima y cuánto tiempo tienes — arma un itinerario con lugares reales de la zona.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/panorama">
                <Button variant="amber" size="lg" className="gap-2 px-8 font-bold">
                  <Sparkles className="h-5 w-5" />
                  Preguntarle a Laki
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-6 text-sm text-white/40">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Gratis</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Lugares reales</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Personalizado</span>
            </div>
          </div>

          {/* Preview card */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-white/[0.05] border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Panorama generado</p>
                  <p className="text-xs text-white/40">Puerto Varas — Día completo</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">Laki</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { time: "09:30", place: "Café del Volcán", type: "☕ Desayuno" },
                  { time: "11:00", place: "Kayak Lago Llanquihue", type: "🚣 Actividad" },
                  { time: "13:30", place: "Club de Yates", type: "🍽️ Almuerzo" },
                  { time: "16:00", place: "Cervecería Del Puerto", type: "🍺 Tarde" },
                  { time: "19:30", place: "El Baqueano", type: "🥩 Cena" },
                ].map((item) => (
                  <div key={item.time} className="flex items-center gap-3 group">
                    <span className="text-xs font-mono text-white/25 w-12 shrink-0">{item.time}</span>
                    <div className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] rounded-xl px-4 py-2.5 border border-white/5 transition-colors cursor-pointer">
                      <p className="text-sm font-semibold text-white/90">{item.place}</p>
                      <p className="text-xs text-white/35 mt-0.5">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTOS CTA ──────────────────────────────────────────────────── */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=90"
          alt="Eventos"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-4 max-w-2xl mx-auto">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Próximos eventos</p>
          <h2 className="text-5xl sm:text-6xl font-black leading-tight mb-5">
            Conciertos, ferias<br />y mucho más
          </h2>
          <p className="text-white/50 mb-8 text-base leading-relaxed">
            Compra tus entradas online para eventos en toda la cuenca del lago.
          </p>
          <Link href="/events">
            <Button variant="amber" size="lg" className="gap-2 px-10 font-bold text-base">
              <Ticket className="h-5 w-5" />
              Ver eventos
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
