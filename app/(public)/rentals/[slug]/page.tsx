import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, BedDouble, Bath, ChevronRight, Bed, Home } from "lucide-react";
import { RENTAL_AMENITIES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";
import { BookingWidget } from "./BookingWidget";
import { PropertyReviewSection } from "./PropertyReviewSection";
import { StarRating } from "@/components/StarRating";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.property.findUnique({ where: { slug }, include: { city: true } });
  if (!p) return {};
  return { title: p.title, description: p.shortDesc ?? `Arriendo en ${p.city.name}` };
}

export default async function RentalDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      city: true,
      photos: { orderBy: { order: "asc" } },
      propertyReviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!property) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Photo gallery */}
      <div className="relative bg-gray-900">
        {property.photos.length > 0 ? (
          <div className="grid grid-cols-4 grid-rows-2 h-64 sm:h-96 gap-1 overflow-hidden">
            {property.photos.slice(0, 5).map((photo, i) => (
              <div key={photo.id} className={`relative overflow-hidden bg-gray-800 ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <Image src={photo.url} alt={photo.alt ?? property.title} fill className="object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
            {property.photos.length === 0 && (
              <div className="col-span-4 row-span-2 flex items-center justify-center text-8xl opacity-20">🏠</div>
            )}
          </div>
        ) : (
          <div className="h-64 sm:h-80 flex items-center justify-center bg-emerald-50">
            <Home className="h-24 w-24 text-emerald-200" strokeWidth={0.8} />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm -mt-6 relative z-10 p-6 mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/rentals" className="hover:text-gray-700">Arriendos</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/rentals?city=${property.city.slug}`} className="hover:text-gray-700">{property.city.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 truncate">{property.title}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{property.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{property.address ?? property.city.name}</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{property.maxGuests} huéspedes</span>
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{property.bedrooms} dormitorio{property.bedrooms > 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.beds} cama{property.beds > 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms} baño{property.bathrooms > 1 ? "s" : ""}</span>
            {property.reviewCount > 0 && (
              <StarRating rating={property.avgRating} size="sm" showValue count={property.reviewCount} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {property.description && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">Sobre el lugar</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
              </section>
            )}

            {property.amenities.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Lo que ofrece</h2>
                <div className="grid grid-cols-2 gap-2">
                  {property.amenities.map((id) => {
                    const a = RENTAL_AMENITIES.find((x) => x.id === id);
                    if (!a) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-2 text-sm text-gray-600 py-1">
                        <span>{a.emoji}</span>{a.label}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {property.lat && property.lng && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">Ubicación</h2>
                <div className="rounded-xl overflow-hidden border border-gray-100 h-56">
                  <iframe
                    src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`}
                    width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade" title={property.title}
                  />
                </div>
              </section>
            )}

            {/* Price breakdown */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Precios</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Precio por noche</span><span className="font-semibold text-gray-900">{formatPrice(property.pricePerNight)}</span></div>
                {property.cleaningFee > 0 && <div className="flex justify-between"><span>Tarifa de limpieza</span><span>{formatPrice(property.cleaningFee)}</span></div>}
                <div className="flex justify-between"><span>Tarifa de servicio ({property.platformFeePercent}%)</span><span>Se calcula al reservar</span></div>
              </div>
            </section>

            <PropertyReviewSection
              propertyId={property.id}
              reviews={property.propertyReviews}
              avgRating={property.avgRating}
              reviewCount={property.reviewCount}
            />
          </div>

          {/* Sidebar */}
          <div>
            <BookingWidget
              slug={property.slug}
              pricePerNight={property.pricePerNight}
              cleaningFee={property.cleaningFee}
              platformFeePercent={property.platformFeePercent}
              maxGuests={property.maxGuests}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

