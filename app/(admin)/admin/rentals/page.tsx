import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Home } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo", INACTIVE: "Inactivo", PENDING: "Pendiente",
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-500",
  PENDING: "bg-amber-100 text-amber-700",
};

export default async function RentalsAdminPage() {
  const properties = await prisma.property.findMany({
    include: { city: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Propiedades en renta</h1>
          <p className="text-sm text-gray-500 mt-0.5">{properties.length} propiedades registradas</p>
        </div>
        <Link href="/admin/rentals/new">
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nueva propiedad</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Home className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Sin propiedades aún</p>
          <Link href="/admin/rentals/new"><Button size="sm" className="mt-4 gap-2"><Plus className="h-4 w-4" />Agregar primera propiedad</Button></Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Propiedad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ciudad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Precio/noche</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.maxGuests} huéspedes · {p.bedrooms} dorm · {p.bathrooms} baño</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.city.name}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">${p.pricePerNight.toLocaleString("es-CL")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/rentals/${p.id}/bookings`}>
                        <Button variant="outline" size="sm" className="text-xs">Reservas</Button>
                      </Link>
                      <Link href={`/admin/rentals/${p.id}/edit`}>
                        <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
