import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Clock, ChevronRight, Compass, Mountain, Bike, Waves, Wind, Fish, Leaf, type LucideIcon } from "lucide-react";
import { ACTIVITY_CATEGORIES, DIFFICULTY_LABELS, CITIES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  tour:       Compass,
  hike:       Mountain,
  bike:       Bike,
  kayak:      Waves,
  horseback:  Wind,
  fishing:    Fish,
  climbing:   Mountain,
  paragliding:Wind,
  rafting:    Waves,
  other:      Leaf,
};

export const metadata: Metadata = {
  title: "Actividades Outdoor | La Cuenca",
  description: "Tours, trekking, kayak, cabalgatas y más actividades outdoor en el Lago Llanquihue.",
};

interface Props {
  searchParams: Promise<{ city?: string; category?: string; difficulty?: string }>;
}

export default async function ActivitiesPage({ searchParams }: Props) {
  const sp = await searchParams;

  const activities = await prisma.activity.findMany({
    where: {
      status: "ACTIVE",
      ...(sp.city ? { city: { slug: sp.city } } : {}),
      ...(sp.category ? { category: sp.category } : {}),
      ...(sp.difficulty ? { difficulty: sp.difficulty as any } : {}),
    },
    include: {
      city: true,
      photos: { take: 1, orderBy: { order: "asc" } },
      _count: { select: { sessions: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const featured = activities.filter((a) => a.featured);
  const rest = activities.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-emerald-200 text-sm font-medium mb-2">Experiencias únicas</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Actividades Outdoor</h1>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            Tours guiados, trekking, kayak, cabalgatas y mucho más en el corazón de la Patagonia Norte.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/activities" className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${!sp.category ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
            <Leaf className="h-3 w-3" />Todas
          </Link>
          {ACTIVITY_CATEGORIES.map((c) => {
            const Icon = ACTIVITY_ICONS[c.id] ?? Leaf;
            const active = sp.category === c.id;
            return (
              <Link key={c.id} href={`/activities?category=${c.id}${sp.city ? `&city=${sp.city}` : ""}`}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                <Icon className="h-3 w-3" />{c.label}
              </Link>
            );
          })}
        </div>

        {/* City filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={sp.category ? `/activities?category=${sp.category}` : "/activities"}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!sp.city ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-200 text-gray-600"}`}>
            Todas las ciudades
          </Link>
          {CITIES.map((c) => (
            <Link key={c.slug} href={`/activities?city=${c.slug}${sp.category ? `&category=${sp.category}` : ""}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sp.city === c.slug ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-200 text-gray-600"}`}>
              {c.name}
            </Link>
          ))}
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🥾</p>
            <p className="text-gray-500">No hay actividades disponibles con estos filtros</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Destacadas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featured.map((a) => <ActivityCard key={a.id} activity={a} large />)}
                </div>
              </section>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((a) => <ActivityCard key={a.id} activity={a} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ activity: a, large }: { activity: any; large?: boolean }) {
  const cat = ACTIVITY_CATEGORIES.find((c) => c.id === a.category);
  const diff = a.difficulty ? DIFFICULTY_LABELS[a.difficulty] : null;
  const photo = a.photos[0];
  const Icon = ACTIVITY_ICONS[a.category] ?? Leaf;

  return (
    <Link href={`/activities/${a.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all block">
      <div className={`relative bg-emerald-50 ${large ? "h-52" : "h-40"}`}>
        {photo ? (
          <Image src={photo.url} alt={photo.alt ?? a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Icon className="h-12 w-12 text-emerald-200" strokeWidth={1} />
          </div>
        )}
        {a.featured && (
          <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">Destacada</span>
        )}
        {diff && (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">
            {diff.label}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 mb-1.5">
          <Icon className="h-3 w-3" />
          <span>{cat?.label}</span>
        </div>
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">{a.title}</h3>
        {a.shortDesc && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{a.shortDesc}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.city.name}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.duration}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />hasta {a.maxParticipants}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-gray-900">{formatPrice(a.pricePerPerson)}</span>
            <span className="text-xs text-gray-400 ml-1">/ persona</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
