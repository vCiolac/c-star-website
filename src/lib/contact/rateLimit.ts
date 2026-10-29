/**
 * Limite de envios por IP, em memória (melhor esforço).
 * Em ambiente serverless cada instância tem seu próprio mapa e ele zera a cada
 * cold start: serve para frear abuso casual, não como garantia. Para algo
 * rígido, trocar por um store compartilhado (ex.: Redis/Upstash).
 */
export type RateLimiter = {
  check(key: string, now?: number): { ok: true } | { ok: false; retryAfterSec: number };
};

export function createRateLimiter({ limit = 5, windowMs = 10 * 60 * 1000, maxKeys = 5000 } = {}): RateLimiter {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [k, list] of hits) {
      const fresh = list.filter((t) => now - t < windowMs);
      if (fresh.length) hits.set(k, fresh);
      else hits.delete(k);
    }
  }

  return {
    check(key, now = Date.now()) {
      if (hits.size > maxKeys) prune(now);
      const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (list.length >= limit) {
        hits.set(key, list);
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil((list[0] + windowMs - now) / 1000)) };
      }
      list.push(now);
      hits.set(key, list);
      return { ok: true };
    }
  };
}

/** IP do cliente a partir dos cabeçalhos do proxy (a Vercel define x-forwarded-for). */
export function clientIp(headers: Headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "anon";
  return headers.get("x-real-ip")?.trim() || "anon";
}
