import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token de tempo mínimo de preenchimento: "<timestamp>.<hmac>".
 * Emitido por GET /api/contact quando o formulário abre; o POST só é aceito
 * se o token for autêntico, tiver pelo menos `minAgeMs` e no máximo `maxAgeMs`.
 */
export const TOKEN_MIN_AGE_MS = 3_000;
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

function sign(secret: string, ts: number) {
  return createHmac("sha256", secret).update(`cstar-contact:${ts}`).digest("base64url");
}

export function createFormToken(secret: string, now: number = Date.now()) {
  return `${now}.${sign(secret, now)}`;
}

export type TokenCheck = "ok" | "invalid" | "too_fast" | "expired";

export function verifyFormToken(
  token: unknown,
  secret: string,
  now: number = Date.now(),
  { minAgeMs = TOKEN_MIN_AGE_MS, maxAgeMs = TOKEN_MAX_AGE_MS } = {}
): TokenCheck {
  if (typeof token !== "string" || token.length > 200) return "invalid";
  const m = /^(\d{10,16})\.([A-Za-z0-9_-]{20,})$/.exec(token);
  if (!m) return "invalid";
  const ts = Number(m[1]);
  const expected = Buffer.from(sign(secret, ts));
  const got = Buffer.from(m[2]);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return "invalid";
  const age = now - ts;
  if (age < minAgeMs) return "too_fast";
  if (age > maxAgeMs) return "expired";
  return "ok";
}
