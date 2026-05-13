"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, MapPin, Ticket, Gift, LayoutDashboard, LogIn, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/directory", label: "Directorio", icon: MapPin },
  { href: "/panorama", label: "Panoramas", icon: Sparkles },
  { href: "/events", label: "Eventos", icon: Ticket },
  { href: "/wallet", label: "Mis Puntos", icon: Gift },
];

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="La Cuenca" width={32} height={32} className="rounded-lg" />
          <div>
            <span className="text-base font-black tracking-tight text-gray-900">La Cuenca</span>
            <span className="hidden sm:block text-[10px] text-gray-400 font-normal leading-none">Lago Llanquihue</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{session.user?.name?.split(" ")[0] ?? session.user?.email?.split("@")[0]}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>Salir</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                Ingresar
              </Button>
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition-colors"
            >
              <Icon className="h-4 w-4 text-gray-400" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
          <div className="pt-2 border-t border-gray-100 mt-1">
            {session ? (
              <Button variant="outline" size="sm" className="w-full" onClick={() => signOut()}>Cerrar sesión</Button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full gap-1.5"><LogIn className="h-4 w-4" />Ingresar</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
