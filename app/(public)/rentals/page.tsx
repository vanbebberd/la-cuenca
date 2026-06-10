import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, BedDouble, Bath, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CITIES } from "@/lib/constants";

interface SearchParams { city?: string; guests?: string; }

export default async function RentalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const city = sp.city;
  const guests = parseInt(sp.guests ?? "1");

  const properties = await prisma.property.findMany({
    where: {
      status: "ACTIVE",
      maxGuests: { gte: guests },
      ...(city && { city: { slug: city } }),
    },
    include: { city: true, photos: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Arriendos en la cuenca</h1>
          <p className="text-gray-500">Cabañas, casas y departamentos en el Lago Llanquihue</p>

          {/* Filters */}
          <form className="flex flex-wrap gap-3 mt-5">
            <select name="city" defaultValue={city ?? ""} className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Todas las ciudades</option>
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <select name="guests" defaultValue={guests} className="px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n} huésped{n > 1 ? "es" : ""}</option>)}
            </select>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">Buscar</button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {properties.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No encontramos propiedades con esos filtros.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">{properties.length} propiedad{properties.length !== 1 ? "es" : ""} disponible{properties.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {properties.map((p) => (
                <Link key={p.id} href={`/rentals/${p.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {p.photos[0] ? (
                      <Image src={p.photos[0].url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">🏠</div>
                    )}
                    {p.featured && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />Destacado
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />{p.city.name}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.maxGuests}</span>
                      <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{p.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.bathrooms}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <span className="text-base font-black text-gray-900">{formatPrice(p.pricePerNight)}</span>
                      <span className="text-xs text-gray-400"> / noche</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
