import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.post.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Nota no encontrada" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.image ? [post.image] : undefined,
      type: "article",
    },
  };
}

export default async function ImperdiblePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="min-h-screen bg-white">
      {post.image && (
        <div className="relative h-[42vh] min-h-[280px] w-full bg-gray-100">
          <Image src={post.image} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/imperdibles" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Todos los imperdibles
        </Link>

        <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">Imperdibles de La Cuenca</p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-gray-500 leading-relaxed mb-8">{post.excerpt}</p>}

        {post.body ? (
          <div className="prose prose-emerald max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-a:text-emerald-700 prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 italic">Esta nota aún no tiene contenido.</p>
        )}
      </div>
    </article>
  );
}
