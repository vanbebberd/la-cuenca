import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, CalendarDays, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default async function RentalSuccessPage({ searchParams }: { searchParams: Promise<{ booking?: string; pending?: string }> }) {
  const sp = await searchParams;
  const booking = sp.booking ? await prisma.propertyBooking.findUnique({
    where: { confirmCode: sp.booking },
    include: { property: true },
  }) : null;

  const isPending = sp.pending === "1";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPending ? "bg-amber-100" : "bg-emerald-100"}`}>
          <CheckCircle2 className={`h-8 w-8 ${isPending ? "text-amber-600" : "text-emerald-600"}`} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">
          {isPending ? "Pago en proceso" : "¡Reserva confirmada!"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isPending
            ? "Tu pago está siendo procesado. Te avisaremos cuando se confirme."
            : "Tu reserva ha sido recibida. Recibirás un email con los detalles."}
        </p>

        {booking && (
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6">
            <p className="font-bold text-gray-800">{booking.property.title}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>{new Date(booking.checkIn).toLocaleDateString("es-CL")} → {new Date(booking.checkOut).toLocaleDateString("es-CL")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{booking.guests} huésped{booking.guests > 1 ? "es" : ""} · {booking.nights} noche{booking.nights > 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{booking.guestEmail}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
              <span>Total pagado</span>
              <span>{formatPrice(booking.totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-400 font-mono">Código: {booking.confirmCode.slice(0, 8).toUpperCase()}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/rentals" className="flex-1"><Button variant="outline" className="w-full">Ver más arriendos</Button></Link>
          <Link href="/" className="flex-1"><Button className="w-full">Inicio</Button></Link>
        </div>
      </div>
    </div>
  );
}
