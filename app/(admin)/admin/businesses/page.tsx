import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { priceRangeLabel } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Locales" };

export default async function AdminBusinessesPage() {
  const businesses = await prisma.business.findMany({
    include: { city: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Locales</h1>
        <Link href="/admin/businesses/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo local
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Categoría</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Ciudad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Precio</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Rating</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {businesses.map((b: (typeof businesses)[number]) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  {b.verified && <span className="text-xs text-blue-600">✓ Verificado</span>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{b.category.name}</td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500">{b.city.name}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 font-mono">{priceRangeLabel(b.priceRange)}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    b.plan === "PRO" ? "bg-amber-100 text-amber-700" :
                    b.plan === "BASIC" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {b.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={b.status === "ACTIVE" ? "green" : b.status === "PENDING" ? "amber" : "secondary"}>
                    {b.status === "ACTIVE" ? "Activo" : b.status === "PENDING" ? "Pendiente" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-amber-500 font-medium">
                  {b.avgRating > 0 ? `★ ${b.avgRating.toFixed(1)}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/directory/${b.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/admin/businesses/${b.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <StatusToggle businessId={b.id} currentStatus={b.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {businesses.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No hay locales registrados</p>
            <Link href="/admin/businesses/new" className="mt-2 text-emerald-600 hover:underline text-sm block">
              Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusToggle({ businessId, currentStatus }: { businessId: string; currentStatus: string }) {
  return currentStatus === "ACTIVE" ? (
    <form action={`/api/admin/businesses/${businessId}/deactivate`} method="POST">
      <button type="submit" className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
        <XCircle className="h-4 w-4" />
      </button>
    </form>
  ) : (
    <form action={`/api/admin/businesses/${businessId}/activate`} method="POST">
      <button type="submit" className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-400 hover:text-emerald-600 transition-colors">
        <CheckCircle className="h-4 w-4" />
      </button>
    </form>
  );
}
