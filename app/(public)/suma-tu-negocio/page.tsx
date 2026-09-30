import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ApplyBusinessForm } from "@/components/ApplyBusinessForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suma tu negocio",
  description: "Súmate gratis al directorio de La Cuenca: restaurantes, hoteles, bares, actividades y más en la cuenca del Lago Llanquihue.",
};

const FIRST_WAVE = 100;

export default async function SumaTuNegocioPage() {
  const joined = await prisma.business.count();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Gratis
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
            Sé uno de los primeros {FIRST_WAVE} negocios de La Cuenca
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
            Estamos armando el directorio de la cuenca del Lago Llanquihue. Súmate ahora
            y sé de los primeros en aparecer — antes de que el directorio se llene.
          </p>

          <div className="mt-8 max-w-xs mx-auto">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (joined / FIRST_WAVE) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {joined >= FIRST_WAVE
                ? `Ya se sumaron los primeros ${FIRST_WAVE} negocios — y seguimos creciendo`
                : `${joined} de ${FIRST_WAVE} primeros negocios ya se sumaron`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-6">
            Cuéntanos de tu negocio y súbele unas fotos. Nosotros revisamos, lo clasificamos
            y lo publicamos — normalmente en un par de días.
          </p>
          <ApplyBusinessForm />
        </div>
      </div>
    </div>
  );
}
