import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Store, Ticket, Gift, Users, Settings, BarChart3, MapPin, Tag, CalendarDays, CreditCard } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/businesses", label: "Locales", icon: Store, adminOnly: false },
  { href: "/admin/reservations", label: "Reservas", icon: CalendarDays, adminOnly: false },
  { href: "/admin/planes", label: "Planes", icon: CreditCard, adminOnly: true },
  { href: "/admin/events", label: "Eventos", icon: Ticket, adminOnly: false },
  { href: "/admin/categories", label: "Categorías", icon: Tag, adminOnly: true },
  { href: "/admin/cities", label: "Ciudades", icon: MapPin, adminOnly: true },
  { href: "/admin/points", label: "Puntos", icon: Gift, adminOnly: true },
  { href: "/admin/users", label: "Usuarios", icon: Users, adminOnly: true },
  { href: "/admin/stats", label: "Estadísticas", icon: BarChart3, adminOnly: true },
  { href: "/admin/settings", label: "Config", icon: Settings, adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session || (role !== "ADMIN" && role !== "BUSINESS_OWNER")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate-900 text-white flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <div className="text-sm font-black text-emerald-400">La Cuenca</div>
          <div className="text-xs text-slate-400 mt-0.5">Panel de administración</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {ADMIN_NAV.filter((item) => role === "ADMIN" || !item.adminOnly).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
          <p className="text-xs text-emerald-400 font-medium">{role}</p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}
