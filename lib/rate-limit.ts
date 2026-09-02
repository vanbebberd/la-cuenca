/**
 * Rate limiter en memoria, por IP. Suficiente para frenar abuso básico
 * de los endpoints que llaman a la API de Claude (costo por request).
 *
 * Nota: es por instancia de servidor (no compartido entre réplicas ni
 * persistente entre cold starts). Para algo más robusto, mover a Upstash.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Barrido ocasional para que el Map no crezca sin límite.
  if (buckets.size > 5_000) {
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
