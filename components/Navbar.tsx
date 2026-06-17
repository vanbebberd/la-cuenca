"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, MapPin, Ticket, Gift, LayoutDashboard, LogIn, Sparkles, Home, Mountain } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { t, type Lang } from "@/lib/i18n";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("es");
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
    const v = match?.[1];
    if (v === "en" || v === "pt") setLang(v);
  }, []);

  const NAV_LINKS = [
    { href: "/directory", label: t("nav_explore", lang), icon: MapPin },
    { href: "/rentals",    label: "Arriendos",              icon: Home },
    { href: "/activities", label: "Actividades",            icon: Mountain },
    { href: "/panorama",  label: "Laki",                  icon: Sparkles },
    { href: "/events",    label: t("nav_events", lang),   icon: Ticket },
    { href: "/wallet",    label: t("nav_points", lang),   icon: Gift },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="La Cuenca" width={160} height={40} className="h-9 w-auto object-contain grayscale opacity-80" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/planes">
            <Button size="sm" variant="outline" className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              {t("nav_join", lang)}
            </Button>
          </Link>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{session.user?.name?.split(" ")[0] ?? session.user?.email?.split("@")[0]}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>{t("nav_logout", lang)}</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                {t("nav_login", lang)}
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
            <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition-colors">
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
          <div className="pt-2 border-t border-gray-100 mt-1 space-y-2">
            <div className="flex justify-center py-1"><LanguageSwitcher /></div>
            <Link href="/planes" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm" className="w-full border-emerald-200 text-emerald-700">{t("nav_join", lang)}</Button>
            </Link>
            {session ? (
              <Button variant="outline" size="sm" className="w-full" onClick={() => signOut()}>{t("nav_close_session", lang)}</Button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full gap-1.5"><LogIn className="h-4 w-4" />{t("nav_login", lang)}</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
