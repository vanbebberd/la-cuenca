import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Eventos" };

interface Props {
  searchParams: Promise<{ ciudad?: string }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const { ciudad } = await searchParams;

  const events = await prisma.event.findMany({
    where: {
      published: true,
      startDate: { gte: new Date() },
      ...(ciudad && { city: { slug: ciudad } }),
    },
    include: {
      city: true,
      ticketTypes: { where: { active: true } },
    },
    orderBy: { startDate: "asc" },
    take: 50,
  });

  const featured = events.filter((e) => e.featured);
  const regular = events.filter((e) => !e.featured);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos en La Cuenca</h1>
          <p className="text-gray-500 text-sm mt-1">Conciertos, festivales, actividades y más</p>
        </div>
      </div>

      {/* City filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <Link href="/events">
          <Badge variant={!ciudad ? "default" : "secondary"} className="cursor-pointer px-3 py-1 text-sm">
            Todas
          </Badge>
        </Link>
        {CITIES.map((c) => (
          <Link key={c.slug} href={`/events?ciudad=${c.slug}`}>
            <Badge variant={ciudad === c.slug ? "default" : "secondary"} className="cursor-pointer px-3 py-1 text-sm whitespace-nowrap">
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Featured events */}
      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} featured />
            ))}
          </div>
        </section>
      )}

      {/* Regular events */}
      {regular.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">Próximos eventos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hay eventos próximos</p>
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  featured = false,
}: {
  event: {
    id: string;
    title: string;
    slug: string;
    image?: string | null;
    startDate: Date;
    location?: string | null;
    city: { name: string };
    ticketTypes: Array<{ price: number; capacity: number; sold: number }>;
  };
  featured?: boolean;
}) {
  const minPrice = event.ticketTypes.length
    ? Math.min(...event.ticketTypes.map((t) => t.price))
    : null;
  const hasAvailability = event.ticketTypes.some((t) => t.sold < t.capacity);

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className={`rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${featured ? "ring-2 ring-emerald-200" : ""}`}>
        <div className={`relative bg-gradient-to-br from-slate-800 to-slate-900 ${featured ? "h-52" : "h-40"}`}>
          {event.image ? (
            <Image src={event.image} alt={event.title} fill className="object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🎭</div>
          )}
          {featured && <Badge className="absolute top-3 left-3">⭐ Destacado</Badge>}
          {!hasAvailability && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Agotado</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-700">{event.title}</h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {format(new Date(event.startDate), "EEEE d MMM yyyy · HH:mm", { locale: es })}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {event.location ?? event.city.name}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            {minPrice !== null ? (
              <span className="font-semibold text-emerald-700 text-sm">
                {minPrice === 0 ? "Gratis" : `Desde $${minPrice.toLocaleString("es-CL")}`}
              </span>
            ) : (
              <span className="text-xs text-gray-400">Sin tickets</span>
            )}
            <Button size="sm" variant="outline" className="text-xs">
              <Ticket className="h-3 w-3" />
              Ver entradas
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
