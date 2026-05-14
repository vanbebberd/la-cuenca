import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Phone, Globe, Link2, MessageCircle, Clock,
  ExternalLink, Navigation, ChevronRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { priceRangeLabel, uberDeepLink } from "@/lib/utils";
import type { Metadata } from "next";
import { ReservationForm } from "./ReservationForm";
import { ReviewSection } from "./ReviewSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = await prisma.business.findUnique({ where: { slug }, include: { city: true, category: true } });
  if (!b) return {};
  return {
    title: b.name,
    description: b.shortDesc ?? `${b.category.name} en ${b.city.name}`,
  };
}

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      city: true,
      photos: { orderBy: { order: "asc" } },
      hours: { orderBy: { dayOfWeek: "asc" } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!business) notFound();

  const today = new Date().getDay();
  const todayHours = business.hours.find((h) => h.dayOfWeek === today);
  const isOpen = todayHours && !todayHours.closed && todayHours.openTime && todayHours.closeTime;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero image — full width */}
      <div className="relative h-64 sm:h-96 bg-gray-100 overflow-hidden">
        {business.coverImage ? (
          <Image src={business.coverImage} alt={business.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-8xl opacity-30">
            🏪
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Breadcrumb over image */}
        <div className="absolute top-4 left-4 right-4">
          <nav className="flex items-center gap-1.5 text-xs text-white/80">
            <Link href="/directory" className="hover:text-white transition-colors">Explorar</Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <Link href={`/directory?ciudad=${business.city.slug}`} className="hover:text-white transition-colors">{business.city.name}</Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-white font-medium truncate">{business.name}</span>
          </nav>
        </div>

        {/* Price range badge on image */}
        {business.priceRange && (
          <div className="absolute bottom-4 right-4">
            <span className="bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-xl">
              {priceRangeLabel(business.priceRange)}
            </span>
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Title bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm -mt-8 relative z-10 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: business.category.color ?? "#10b981" }}
                >
                  {business.category.name}
                </span>
                {business.verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verificado
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isOpen ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-gray-400"}`} />
                  {isOpen ? "Abierto ahora" : "Cerrado ahora"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{business.name}</h1>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <StarRating rating={business.avgRating} size="lg" showValue count={business.reviewCount} />
                {business.address && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {business.address}, {business.city.name}
                  </div>
                )}
              </div>
            </div>
            {/* Quick contact buttons */}
            <div className="flex gap-2 shrink-0">
              {business.phone && (
                <a href={`tel:${business.phone}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Llamar
                  </Button>
                </a>
              )}
              {business.whatsapp && (
                <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            {business.description && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">Sobre el lugar</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{business.description}</p>
              </section>
            )}

            {/* Photo gallery */}
            {business.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Galería de fotos</h2>
                <div className="grid grid-cols-3 gap-2">
                  {business.photos.slice(0, 6).map((photo, i: number) => (
                    <div
                      key={photo.id}
                      className={`relative overflow-hidden rounded-xl bg-gray-100 ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
                    >
                      <Image src={photo.url} alt={photo.alt ?? business.name} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Hours */}
            {business.hours.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Horarios de atención
                </h2>
                <div className="space-y-1">
                  {DAYS.map((day, i) => {
                    const h = business.hours.find((x) => x.dayOfWeek === i);
                    const isToday = i === today;
                    return (
                      <div
                        key={i}
                        className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isToday ? "bg-emerald-50 font-semibold text-emerald-800" : "text-gray-600"}`}
                      >
                        <span>{day}{isToday && <span className="ml-2 text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">hoy</span>}</span>
                        <span className={isToday ? "text-emerald-700" : "text-gray-400"}>
                          {!h || h.closed ? "Cerrado" : h.openTime && h.closeTime ? `${h.openTime} – ${h.closeTime}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Menu */}
            {business.menuUrl && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">Carta / Menú</h2>
                <a href={business.menuUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Ver carta completa
                  </Button>
                </a>
              </section>
            )}

            {/* Reviews */}
            <ReviewSection
              businessId={business.id}
              reviews={business.reviews}
              avgRating={business.avgRating}
              reviewCount={business.reviewCount}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact & location card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Contacto y cómo llegar</h2>

              <div className="space-y-2.5">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-emerald-700 transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                    <span>{business.phone}</span>
                  </a>
                )}
                {business.whatsapp && (
                  <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-700 transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span>WhatsApp</span>
                  </a>
                )}
                {business.instagram && (
                  <a href={`https://instagram.com/${business.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-pink-700 transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                      <Link2 className="h-3.5 w-3.5 text-pink-600" />
                    </div>
                    <span>@{business.instagram.replace("@", "")}</span>
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Globe className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span>Sitio web</span>
                  </a>
                )}
                {business.facebook && (
                  <a href={`https://facebook.com/${business.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Link2 className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span>Facebook</span>
                  </a>
                )}
              </div>

              {/* Map embed + buttons */}
              {business.lat && business.lng && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  {/* Embedded map */}
                  <div className="rounded-xl overflow-hidden border border-gray-100 h-44">
                    <iframe
                      src={`https://maps.google.com/maps?q=${business.lat},${business.lng}&z=16&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Mapa de ${business.name}`}
                    />
                  </div>
                  {/* Action buttons */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                      <MapPin className="h-3.5 w-3.5 text-red-500" />
                      Abrir en Google Maps
                    </Button>
                  </a>
                  <a href={uberDeepLink(business.lat, business.lng, business.name)} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" className="w-full gap-2 justify-start mt-2">
                      <Navigation className="h-3.5 w-3.5" />
                      Pedir Uber para llegar
                    </Button>
                  </a>
                </div>
              )}

              {/* Points */}
              {business.pointsEnabled && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
                  <p className="font-bold mb-0.5">🎁 Acumula puntos aquí</p>
                  <p className="text-amber-700">Gana {Math.round(business.pointsPerPeso * 1000)} pts por cada $1.000</p>
                </div>
              )}
            </div>

            {/* Reservation card */}
            <ReservationForm businessId={business.id} businessName={business.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
