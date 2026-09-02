import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imperdibles de La Cuenca",
  description: "Guías y notas de la cuenca del Lago Llanquihue: los mejores restaurantes, hoteles, panoramas y actividades de la zona.",
};

export default async function ImperdiblesIndex() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const href = (p: { slug: string | null; linkUrl: string | null }) =>
    p.slug ? `/imperdibles/${p.slug}` : p.linkUrl ?? null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">Guías de la zona</p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Imperdibles de La Cuenca</h1>
        <p className="text-gray-500 max-w-xl leading-relaxed mb-10">
          Los mejores restaurantes, hoteles, panoramas y actividades de la cuenca del Lago Llanquihue, contados por quienes conocen la zona.
        </p>

        {posts.length === 0 ? (
          <p className="text-gray-400 py-16 text-center">Aún no hay notas publicadas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const to = href(post);
              const card = (
                <div className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden shrink-0">
                    {post.image ? (
                      <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="420px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">📝</div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-black text-gray-900 text-base leading-snug mb-2">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-gray-500 leading-relaxed flex-1">{post.excerpt}</p>}
                    {to && (
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                        Leer <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
              if (!to) return <div key={post.id} className="h-full">{card}</div>;
              return to.startsWith("http") ? (
                <a key={post.id} href={to} target="_blank" rel="noopener noreferrer" className="block h-full">{card}</a>
              ) : (
                <Link key={post.id} href={to} className="block h-full">{card}</Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
