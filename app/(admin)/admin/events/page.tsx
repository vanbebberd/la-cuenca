import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Eventos" };

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: {
      city: true,
      ticketTypes: true,
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Eventos</h1>
        <Link href="/admin/events/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo evento
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Evento</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Ciudad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Tickets</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.map((e: (typeof events)[number]) => {
              const totalSold = e.ticketTypes.reduce((s: number, t) => s + t.sold, 0);
              const totalCapacity = e.ticketTypes.reduce((s: number, t) => s + t.capacity, 0);
              return (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{e.title}</div>
                    {e.featured && <span className="text-xs text-amber-500">⭐ Destacado</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                    {format(new Date(e.startDate), "d MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{e.city.name}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                    {totalCapacity > 0 ? `${totalSold}/${totalCapacity}` : "Sin tickets"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={e.published ? "green" : "secondary"}>
                      {e.published ? "Publicado" : "Borrador"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/events/${e.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/admin/events/${e.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {events.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No hay eventos</p>
            <Link href="/admin/events/new" className="mt-2 text-emerald-600 hover:underline text-sm block">Crear el primero</Link>
          </div>
        )}
      </div>
    </div>
  );
}
