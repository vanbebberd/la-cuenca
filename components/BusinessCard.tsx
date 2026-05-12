import Link from "next/link";
import Image from "next/image";
import { MapPin, CheckCircle2, Star } from "lucide-react";
import { priceRangeLabel } from "@/lib/utils";

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    slug: string;
    shortDesc?: string | null;
    coverImage?: string | null;
    priceRange?: string | null;
    avgRating: number;
    reviewCount: number;
    address?: string | null;
    verified: boolean;
    category: { name: string; color?: string | null };
    city: { name: string };
    hours?: Array<{ dayOfWeek: number; openTime?: string | null; closeTime?: string | null; closed: boolean }>;
  };
}

function isOpenNow(hours?: BusinessCardProps["business"]["hours"]): boolean | null {
  if (!hours?.length) return null;
  const now = new Date();
  const day = now.getDay();
  const todayHours = hours.find((h) => h.dayOfWeek === day);
  if (!todayHours || todayHours.closed) return false;
  if (!todayHours.openTime || !todayHours.closeTime) return null;
  const [oh, om] = todayHours.openTime.split(":").map(Number);
  const [ch, cm] = todayHours.closeTime.split(":").map(Number);
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= oh * 60 + om && current <= ch * 60 + cm;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const open = isOpenNow(business.hours);
  const color = business.category.color ?? "#10b981";

  return (
    <Link href={`/directory/${business.slug}`} className="group block h-full">
      <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100/80">

        {/* Image */}
        <div className="relative h-52 overflow-hidden flex-shrink-0 bg-gray-100">
          {business.coverImage ? (
            <Image
              src={business.coverImage}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 360px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <span className="text-5xl opacity-30">🏪</span>
            </div>
          )}

          {/* Gradient at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {business.category.name}
            </span>
          </div>

          {/* Open/closed pill */}
          {open !== null && (
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${open ? "bg-emerald-500 text-white" : "bg-gray-900/80 text-gray-300"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-white animate-pulse" : "bg-gray-500"}`} />
                {open ? "Abierto" : "Cerrado"}
              </span>
            </div>
          )}

          {/* Price at bottom right of image */}
          {business.priceRange && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-lg">
                {priceRangeLabel(business.priceRange)}
              </span>
            </div>
          )}
        </div>

        {/* Colored accent line */}
        <div className="h-0.5 w-full" style={{ backgroundColor: color }} />

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-start gap-2 mb-1.5">
            <h3 className="font-black text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 flex-1 text-[15px] leading-tight">
              {business.name}
            </h3>
            {business.verified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            )}
          </div>

          {business.shortDesc && (
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4">
              {business.shortDesc}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              {business.avgRating > 0 ? (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i <= Math.round(business.avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{business.avgRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({business.reviewCount})</span>
                </>
              ) : (
                <span className="text-xs text-gray-300">Sin reseñas</span>
              )}
            </div>

            {/* City */}
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <MapPin className="h-3 w-3" />
              <span>{business.city.name}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
