import { CheckCircle2, Sparkles, Star, MapPin, Phone, Image, Clock, MessageCircle, BarChart3, Shield } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes para negocios — La Cuenca",
  description: "Promociona tu negocio en el directorio de la cuenca del Lago Llanquihue.",
};

const PLANS = [
  {
    name: "Free",
    price: "Gratis",
    desc: "Para empezar a ser encontrado",
    color: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
    button: "bg-gray-900 hover:bg-gray-800 text-white",
    features: [
      { label: "Perfil en el directorio", ok: true },
      { label: "Nombre, categoría y ciudad", ok: true },
      { label: "Dirección y mapa", ok: true },
      { label: "Fotos de galería", ok: false },
      { label: "Horarios de atención", ok: false },
      { label: "WhatsApp y redes sociales", ok: false },
      { label: "Carta / menú online", ok: false },
      { label: "Destacado en el inicio", ok: false },
      { label: "Badge verificado", ok: false },
    ],
  },
  {
    name: "Basic",
    price: "$15.000",
    period: "/mes",
    desc: "Para negocios que quieren destacar",
    color: "border-blue-300",
    badge: "bg-blue-100 text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    popular: false,
    features: [
      { label: "Perfil en el directorio", ok: true },
      { label: "Nombre, categoría y ciudad", ok: true },
      { label: "Dirección y mapa", ok: true },
      { label: "Fotos de galería (hasta 6)", ok: true },
      { label: "Horarios de atención", ok: true },
      { label: "WhatsApp y redes sociales", ok: true },
      { label: "Carta / menú online", ok: true },
      { label: "Destacado en el inicio", ok: false },
      { label: "Badge verificado", ok: false },
    ],
  },
  {
    name: "Pro",
    price: "$29.000",
    period: "/mes",
    desc: "Máxima visibilidad en la cuenca",
    color: "border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    button: "bg-amber-500 hover:bg-amber-600 text-white",
    popular: true,
    features: [
      { label: "Perfil en el directorio", ok: true },
      { label: "Nombre, categoría y ciudad", ok: true },
      { label: "Dirección y mapa", ok: true },
      { label: "Fotos de galería (ilimitadas)", ok: true },
      { label: "Horarios de atención", ok: true },
      { label: "WhatsApp y redes sociales", ok: true },
      { label: "Carta / menú online", ok: true },
      { label: "Destacado en el inicio", ok: true },
      { label: "Badge verificado ✓", ok: true },
    ],
  },
];

const ICONS: Record<string, typeof CheckCircle2> = {
  "Fotos de galería (hasta 6)": Image,
  "Fotos de galería (ilimitadas)": Image,
  "Horarios de atención": Clock,
  "WhatsApp y redes sociales": MessageCircle,
  "Carta / menú online": Star,
  "Destacado en el inicio": Sparkles,
  "Badge verificado ✓": Shield,
  "Dirección y mapa": MapPin,
};

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-3">Para negocios</p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Llega a más clientes<br />en la cuenca
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Miles de personas buscan restaurantes, cafés, actividades y más en el directorio de La Cuenca. Asegúrate de que te encuentren a ti.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 ${plan.color} p-6 flex flex-col ${plan.popular ? "shadow-lg shadow-amber-100" : "shadow-sm"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">Más popular</span>
                </div>
              )}

              <div className="mb-5">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${plan.badge}`}>{plan.name}</span>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 text-sm mb-1">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-500">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => {
                  const Icon = ICONS[f.label] ?? CheckCircle2;
                  return (
                    <li key={f.label} className={`flex items-center gap-2.5 text-sm ${f.ok ? "text-gray-700" : "text-gray-300 line-through"}`}>
                      <Icon className={`h-4 w-4 shrink-0 ${f.ok ? "text-emerald-500" : "text-gray-200"}`} />
                      {f.label}
                    </li>
                  );
                })}
              </ul>

              <a
                href={`https://wa.me/56922425202?text=Hola, quiero activar el plan ${plan.name} para mi negocio en La Cuenca`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-colors ${plan.button}`}
              >
                {plan.name === "Free" ? "Registrar mi negocio" : `Activar plan ${plan.name}`}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Cómo pago?", a: "Por transferencia bancaria o MercadoPago. Te contactamos para coordinar." },
              { q: "¿Puedo cambiar de plan?", a: "Sí, en cualquier momento. El cambio se aplica de inmediato." },
              { q: "¿Hay permanencia mínima?", a: "No. Puedes cancelar cuando quieras, sin penalidades." },
              { q: "¿Qué pasa con el plan Free?", a: "Tu negocio aparece en el directorio de forma básica, sin costo y sin límite de tiempo." },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="font-semibold text-gray-900 mb-1">{item.q}</p>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10 text-sm text-gray-400">
          ¿Tienes dudas? Escríbenos a{" "}
          <a href="mailto:hola@lacuenca.cl" className="text-emerald-600 hover:underline">hola@lacuenca.cl</a>
        </div>
      </div>
    </div>
  );
}
