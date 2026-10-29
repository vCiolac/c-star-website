import { readContactConfig } from "./config";
import { buildMail, type SendMail } from "./mailer";
import { clientIp, type RateLimiter } from "./rateLimit";
import { CONTACT_LIMITS, validateContact } from "./schema";
import { createFormToken, verifyFormToken } from "./token";

export type ContactDeps = {
  env: Record<string, string | undefined>;
  send: SendMail;
  limiter: RateLimiter;
  now?: () => number;
};

/** Códigos de erro estáveis consumidos pela UI. */
export type ContactErrorCode =
  | "envio_indisponivel"
  | "muitas_tentativas"
  | "formato_invalido"
  | "corpo_grande"
  | "dados_invalidos"
  | "rejeitado"
  | "token_invalido"
  | "rapido_demais"
  | "token_expirado"
  | "falha_envio";

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}

function fail(status: number, error: ContactErrorCode, extra: Record<string, unknown> = {}, headers?: Record<string, string>) {
  return json(status, { error, ...extra }, headers);
}

/** GET: emite o token de tempo mínimo (ou 503 se o envio não estiver configurado). */
export function handleContactGet(deps: Pick<ContactDeps, "env" | "now">) {
  const cfg = readContactConfig(deps.env);
  if (!cfg.ok) return fail(503, "envio_indisponivel");
  return json(200, { token: createFormToken(cfg.config.secret, (deps.now ?? Date.now)()) });
}

/** POST: valida, aplica proteções anti-abuso e envia por SMTP. Nunca simula sucesso. */
export async function handleContactPost(req: Request, deps: ContactDeps): Promise<Response> {
  const now = (deps.now ?? Date.now)();
  const cfg = readContactConfig(deps.env);
  if (!cfg.ok) return fail(503, "envio_indisponivel");
  const config = cfg.config;

  const ip = clientIp(req.headers);
  const rl = deps.limiter.check(ip, now);
  if (!rl.ok) return fail(429, "muitas_tentativas", {}, { "retry-after": String(rl.retryAfterSec) });

  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return fail(415, "formato_invalido");
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > CONTACT_LIMITS.bodyMax) return fail(413, "corpo_grande");

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return fail(400, "formato_invalido");
  }
  if (Buffer.byteLength(raw, "utf8") > CONTACT_LIMITS.bodyMax) return fail(413, "corpo_grande");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "formato_invalido");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, "formato_invalido");
  const b = body as Record<string, unknown>;

  // Honeypot: campo invisível para pessoas; preenchido = robô.
  const hp = b.website;
  if (hp != null && !(typeof hp === "string" && hp.trim() === "")) return fail(422, "rejeitado");

  const v = validateContact({ name: b.name, email: b.email, subject: b.subject, message: b.message });
  if (!v.ok) return fail(400, "dados_invalidos", { fields: v.fields });

  const t = verifyFormToken(b.token, config.secret, now);
  if (t === "invalid") return fail(400, "token_invalido");
  if (t === "too_fast") return fail(400, "rapido_demais");
  if (t === "expired") return fail(400, "token_expirado");

  try {
    await deps.send(config, buildMail(config, v.value, { ip, at: new Date(now) }));
  } catch (err) {
    console.error("[contato] falha no envio SMTP:", err instanceof Error ? err.message : err);
    return fail(502, "falha_envio");
  }
  return json(200, { ok: true });
}
