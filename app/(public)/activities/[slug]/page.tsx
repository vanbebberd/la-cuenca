import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Clock, ChevronRight, Check, AlertCircle } from "lucide-react";
import { ACTIVITY_CATEGORIES, DIFFICULTY_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";
import { SessionPicker } from "./SessionPicker";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await prisma.activity.findUnique({ where: { slug }, include: { city: true } });
  if (!a) return {};
  return { title: `${a.title} | La Cuenca`, description: a.shortDesc ?? `Actividad outdoor en ${a.city.name}` };
}

export default async function ActivityDetailPage({ params }: Props) {
  const { slug } = await params;
  const activity = await prisma.activity.findUnique({
    where: { slug, status: "ACTIVE" },
    include: { city: true, photos: { orderBy: { order: "asc" } } },
  });
  if (!activity) notFound();

  const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.category);
  const diff = activity.difficulty ? DIFFICULTY_LABELS[activity.difficulty] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Photo gallery */}
      <div className="relative bg-gray-900">
        {activity.photos.length > 0 ? (
          <div className="grid grid-cols-4 grid-rows-2 h-64 sm:h-96 gap-1 overflow-hidden">
            {activity.photos.slice(0, 5).map((photo, i) => (
              <div key={photo.id} className={`relative overflow-hidden bg-gray-800 ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <Image src={photo.url} alt={photo.alt ?? activity.title} fill className="object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 sm:h-80 flex items-center justify-center text-8xl opacity-20 bg-gray-100">
            {cat?.emoji ?? "🌿"}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Title card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm -mt-6 relative z-10 p-6 mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/activities" className="hover:text-gray-700">Actividades</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/activities?city=${activity.city.slug}`} className="hover:text-gray-700">{activity.city.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 truncate">{activity.title}</span>
          </nav>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                {cat && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{cat.emoji} {cat.label}</span>}
                {diff && <span className={`text-xs bg-${diff.color}-50 text-${diff.color}-700 px-2 py-0.5 rounded-full font-medium`}>{diff.label}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{activity.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{activity.city.name}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.duration}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{activity.minParticipants}–{activity.maxParticipants} personas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {activity.description && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">Sobre la actividad</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{activity.description}</p>
              </section>
            )}

            {activity.includes.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">¿Qué incluye?</h2>
                <div className="grid grid-cols-2 gap-2">
                  {activity.includes.map((item) => (
                    <span key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />{item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {activity.requirements && (
              <section className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-sm font-bold text-amber-900 mb-1">Requerimientos</h2>
                    <p className="text-sm text-amber-700 leading-relaxed">{activity.requirements}</p>
                  </div>
                </div>
              </section>
            )}

            {activity.meetingPoint && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-2">Punto de encuentro</h2>
                <p className="text-sm text-gray-600 mb-3">{activity.meetingPoint}</p>
                {activity.lat && activity.lng && (
                  <div className="rounded-xl overflow-hidden border border-gray-100 h-56">
                    <iframe
                      src={`https://maps.google.com/maps?q=${activity.lat},${activity.lng}&z=15&output=embed`}
                      width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade" title={activity.title}
                    />
                  </div>
                )}
              </section>
            )}

            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Precio</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Precio por persona</span>
                  <span className="font-semibold text-gray-900">{formatPrice(activity.pricePerPerson)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarifa de servicio ({activity.platformFeePercent}%)</span>
                  <span>Se calcula al reservar</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Mínimo</span><span>{activity.minParticipants} persona{activity.minParticipants > 1 ? "s" : ""}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: session picker */}
          <div className="lg:sticky lg:top-24 self-start">
            <SessionPicker
              slug={activity.slug}
              pricePerPerson={activity.pricePerPerson}
              platformFeePercent={activity.platformFeePercent}
              minParticipants={activity.minParticipants}
              maxParticipants={activity.maxParticipants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
