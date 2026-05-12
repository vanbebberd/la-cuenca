import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "La Cuenca — Lago Llanquihue", template: "%s | La Cuenca" },
  description:
    "Descubre restaurantes, hoteles, bares, actividades y eventos en Puerto Montt, Puerto Varas, Llanquihue, Frutillar y Puerto Octay.",
  keywords: ["Puerto Varas", "Puerto Montt", "Lago Llanquihue", "restaurantes", "hoteles", "turismo", "eventos"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "La Cuenca" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "La Cuenca",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-white min-h-screen">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-gray-100 bg-white py-10 mt-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="font-black text-gray-900 text-base">La Cuenca</div>
                  <p className="text-xs text-gray-400 mt-1">El mejor directorio de la cuenca del Lago Llanquihue</p>
                </div>
                <div className="flex gap-6 text-sm text-gray-400 flex-wrap">
                  <span className="hover:text-gray-600 cursor-default">Puerto Montt</span>
                  <span className="hover:text-gray-600 cursor-default">Puerto Varas</span>
                  <span className="hover:text-gray-600 cursor-default">Llanquihue</span>
                  <span className="hover:text-gray-600 cursor-default">Frutillar</span>
                  <span className="hover:text-gray-600 cursor-default">Puerto Octay</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-300">
                <span>© 2025 La Cuenca</span>
                <span>Región de Los Lagos, Chile</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
