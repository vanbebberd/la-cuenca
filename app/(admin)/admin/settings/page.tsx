import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Configuración" };

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Configuración</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">General</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span>Nombre del sitio</span>
            <span className="font-medium text-gray-900">La Cuenca</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span>Región</span>
            <span className="font-medium text-gray-900">Lago Llanquihue, Chile</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Moneda</span>
            <span className="font-medium text-gray-900">CLP (Peso Chileno)</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <p className="text-sm text-amber-800">
          La configuración avanzada (logos, banners, colores del sitio) se editará directamente en los archivos de código.
          Habla con tu desarrollador para personalizar estos elementos.
        </p>
      </div>
    </div>
  );
}
