"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  user: { name?: string | null; image?: string | null };
}

interface Props {
  businessId: string;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}

export function ReviewSection({ businessId, reviews: initial, avgRating, reviewCount }: Props) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initial);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, rating, comment }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Reseñas</h2>
          <div className="flex items-center gap-2">
            <StarRating rating={avgRating} size="md" showValue count={reviewCount} />
          </div>
        </div>

        {/* Write review */}
        {!submitted && (
          <div className="border-t border-gray-100 pt-4">
            {session ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Deja tu reseña</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(n)}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${n <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20"
                />
                <Button type="submit" size="sm" disabled={!rating || loading}>
                  {loading ? "Publicando..." : "Publicar reseña"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-gray-500 mb-2">Inicia sesión para dejar tu reseña</p>
                <Link href="/login"><Button size="sm" variant="outline">Ingresar</Button></Link>
              </div>
            )}
          </div>
        )}

        {/* Reviews list */}
        <div className="mt-4 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sé el primero en reseñar este lugar</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-t border-gray-50 pt-4 first:border-0 first:pt-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
                    {r.user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.user.name ?? "Usuario"}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
