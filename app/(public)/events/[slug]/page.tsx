import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TicketPurchase } from "./TicketPurchase";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await prisma.event.findUnique({ where: { slug } });
  return e ? { title: e.title } : {};
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug, published: true },
    include: {
      city: true,
      ticketTypes: { where: { active: true }, orderBy: { price: "asc" } },
    },
  });

  if (!event) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/events" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver a eventos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
            {event.image ? (
              <Image src={event.image} alt={event.title} fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl">🎭</div>
            )}
            {event.featured && <Badge className="absolute top-4 left-4 text-sm">⭐ Destacado</Badge>}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-black text-gray-900">{event.title}</h1>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">
                  {format(new Date(event.startDate), "EEEE d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">{event.location ?? event.city.name}</span>
              </div>
              {event.ticketTypes.length > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">
                    {event.ticketTypes.reduce((s: number, t: (typeof event.ticketTypes)[number]) => s + (t.capacity - t.sold), 0)} entradas disponibles
                  </span>
                </div>
              )}
            </div>
          </div>

          {event.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}

          {/* Map */}
          {event.lat && event.lng && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
            >
              <MapPin className="h-4 w-4" />
              Ver ubicación en Google Maps
            </a>
          )}
        </div>

        {/* Ticket purchase */}
        <div>
          <TicketPurchase event={event} ticketTypes={event.ticketTypes} />
        </div>
      </div>
    </div>
  );
}
