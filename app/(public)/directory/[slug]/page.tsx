import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Phone, Globe, Link2, MessageCircle, Clock,
  ExternalLink, Navigation, ChevronRight, CheckCircle2, Tag, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { priceRangeLabel, uberDeepLink } from "@/lib/utils";
import { AMENITIES } from "@/lib/constants";
import { t, tDays } from "@/lib/i18n";
import { getLang } from "@/lib/get-lang";
import type { Metadata } from "next";
import { ReservationForm } from "./ReservationForm";
import { ReviewSection } from "./ReviewSection";
import { BusinessChat } from "@/components/BusinessChat";
import { BusinessTracker } from "@/components/BusinessTracker";
import { TrackedLink } from "@/components/TrackedLink";

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


export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      city: true,
      photos: { orderBy: { order: "asc" } },
      hours: { orderBy: { dayOfWeek: "asc" } },
      rewards: { where: { active: true }, orderBy: { pointsCost: "asc" } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      productSections: { orderBy: { order: "asc" } },
      products: {
        where: { available: true },
        orderBy: [{ order: "asc" }],
      },
      offers: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!business) notFound();

  const lang = await getLang();
  const DAYS = tDays(lang);
  const today = new Date().getDay();
  const todayHours = business.hours.find((h) => h.dayOfWeek === today);
  const isOpen = todayHours && !todayHours.closed && todayHours.openTime && todayHours.closeTime;

  const now = new Date();
  const activeOffers = business.offers.filter((o) => !o.validTo || new Date(o.validTo) >= now);

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessTracker businessId={business.id} autoTrack="VIEW" />
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
            <Link href="/directory" className="hover:text-white transition-colors">{t("bus_explore", lang)}</Link>
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
                    {t("bus_verified", lang)}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isOpen ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-gray-400"}`} />
                  {isOpen ? t("bus_open_now", lang) : t("bus_closed_now", lang)}
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
                <TrackedLink href={`tel:${business.phone}`} businessId={business.id} event="CALL_CLICK">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {t("bus_call", lang)}
                  </Button>
                </TrackedLink>
              )}
              {business.whatsapp && (
                <TrackedLink href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} businessId={business.id} event="WHATSAPP_CLICK" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                </TrackedLink>
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
                <h2 className="text-base font-bold text-gray-900 mb-3">{t("bus_about", lang)}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{business.description}</p>
              </section>
            )}

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">{t("bus_amenities", lang)}</h2>
                <div className="flex flex-wrap gap-2">
                  {business.amenities.map(id => {
                    const a = AMENITIES.find(x => x.id === id);
                    if (!a) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                        <span style={{ filter: "grayscale(1) opacity(0.7)" }}>{a.emoji}</span>
                        {a.label}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Photo gallery */}
            {business.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">{t("bus_gallery", lang)}</h2>
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

            {/* Active offers */}
            {activeOffers.length > 0 && (
              <section className="bg-white rounded-2xl border border-orange-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-orange-500" />
                  {t("bus_offers_title", lang)}
                </h2>
                <div className="space-y-3">
                  {activeOffers.map((offer) => (
                    <div key={offer.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                      {offer.badge && (
                        <span className="shrink-0 text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded-lg mt-0.5">
                          {offer.badge}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{offer.title}</p>
                        {offer.description && <p className="text-xs text-gray-500 mt-0.5">{offer.description}</p>}
                        {offer.validTo && (
                          <p className="text-xs text-orange-500 mt-1 font-medium">
                            {t("bus_offer_valid_until", lang)} {new Date(offer.validTo).toLocaleDateString("es-CL")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Product catalog */}
            {business.products.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gray-400" />
                  {t("bus_catalog_title", lang)}
                </h2>
                {business.productSections.length > 0 ? (
                  business.productSections.map((section) => {
                    const sectionProducts = business.products.filter((p) => p.sectionId === section.id);
                    if (!sectionProducts.length) return null;
                    return (
                      <div key={section.id} className="mb-5 last:mb-0">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{section.name}</p>
                        <div className="space-y-2">
                          {sectionProducts.map((product) => <ProductItem key={product.id} product={product} />)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="space-y-2">
                    {business.products.map((product) => <ProductItem key={product.id} product={product} />)}
                  </div>
                )}
                {/* Unsectioned items when sections exist */}
                {business.productSections.length > 0 && business.products.filter((p) => !p.sectionId).length > 0 && (
                  <div className="mt-5">
                    <div className="space-y-2">
                      {business.products.filter((p) => !p.sectionId).map((product) => <ProductItem key={product.id} product={product} />)}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Hours */}
            {business.hours.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {t("bus_hours", lang)}
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
                        <span>{day}{isToday && <span className="ml-2 text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">{t("bus_today", lang)}</span>}</span>
                        <span className={isToday ? "text-emerald-700" : "text-gray-400"}>
                          {!h || h.closed ? t("bus_day_closed", lang) : h.openTime && h.closeTime ? `${h.openTime} – ${h.closeTime}` : "—"}
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
                <h2 className="text-base font-bold text-gray-900 mb-3">{t("bus_menu", lang)}</h2>
                <a href={business.menuUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {t("bus_view_menu", lang)}
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-bold text-gray-900 mb-4">{t("bus_contact", lang)}</h2>

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
                  <TrackedLink href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`} businessId={business.id} event="DIRECTIONS_CLICK" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                      <MapPin className="h-3.5 w-3.5 text-red-500" />
                      {t("bus_open_maps", lang)}
                    </Button>
                  </TrackedLink>
                  <a href={uberDeepLink(business.lat, business.lng, business.name)} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" className="w-full gap-2 justify-start mt-2">
                      <Navigation className="h-3.5 w-3.5" />
                      {t("bus_uber", lang)}
                    </Button>
                  </a>
                </div>
              )}

              {/* Points */}
              {business.pointsEnabled && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
                  <p className="font-bold mb-0.5">🎁 {t("bus_points_title", lang)}</p>
                  <p className="text-amber-700">{lang === "es" ? "Gana" : lang === "en" ? "Earn" : "Ganhe"} {Math.round(business.pointsPerPeso * 1000)} {t("bus_points_earn", lang)}</p>
                </div>
              )}

              {/* Rewards */}
              {business.rewards.length > 0 && (
                <div className="mt-4 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-700">🎟️ {t("bus_rewards_title", lang)}</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {business.rewards.map(r => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{r.title}</p>
                          {r.description && <p className="text-xs text-gray-400">{r.description}</p>}
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg shrink-0 ml-2">
                          {r.pointsCost.toLocaleString("es-CL")} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reservation card */}
            <ReservationForm businessId={business.id} businessName={business.name} />
          </div>
        </div>
      </div>

      {business.plan === "PRO" && <BusinessChat businessId={business.id} businessName={business.name} />}
    </div>
  );
}

function ProductItem({ product }: { product: { id: string; name: string; description?: string | null; price?: number | null; image?: string | null } }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      {product.image && (
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{product.name}</p>
        {product.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>}
      </div>
      {product.price != null && (
        <span className="text-sm font-bold text-emerald-700 shrink-0">${product.price.toLocaleString("es-CL")}</span>
      )}
    </div>
  );
}
