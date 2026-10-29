import { describe, expect, it, vi } from "vitest";
import { readContactConfig } from "@/lib/contact/config";
import { handleContactGet, handleContactPost } from "@/lib/contact/handler";
import { buildMail, type SendMail } from "@/lib/contact/mailer";
import { clientIp, createRateLimiter } from "@/lib/contact/rateLimit";
import { validateContact } from "@/lib/contact/schema";
import { createFormToken, verifyFormToken } from "@/lib/contact/token";

const SECRET = "s3cr3t-de-teste";
const ENV = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "587",
  SMTP_USER: "bot@example.com",
  SMTP_PASS: "pw",
  CONTACT_FORM_SECRET: SECRET
};
const T0 = 1_761_700_000_000;

const valid = {
  name: "Ana Souza",
  email: "ana@example.com",
  subject: "Parceria",
  message: "Olá! Queremos conversar sobre uma parceria."
};

function post(body: unknown, headers: Record<string, string> = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...headers },
    body: raw
  });
}

function deps(over: Partial<Parameters<typeof handleContactPost>[1]> = {}) {
  const send = vi.fn<SendMail>(async () => undefined);
  return {
    send,
    d: { env: ENV, send, limiter: createRateLimiter({ limit: 5 }), now: () => T0 + 10_000, ...over }
  };
}

const token = createFormToken(SECRET, T0);

describe("validateContact", () => {
  it("aceita dados válidos e normaliza espaços", () => {
    const r = validateContact({ ...valid, name: "  Ana Souza  " });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.name).toBe("Ana Souza");
  });

  it("rejeita campos vazios, e-mail inválido e assunto desconhecido", () => {
    const r = validateContact({ name: "", email: "x", subject: "Spam", message: "curta" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fields).sort()).toEqual(["email", "message", "name", "subject"]);
  });

  it("bloqueia quebras de linha em nome e e-mail (injeção de cabeçalho)", () => {
    expect(validateContact({ ...valid, name: "Ana\r\nBcc: x@y.z" }).ok).toBe(false);
    expect(validateContact({ ...valid, email: "ana@example.com\nBcc: x@y.z" }).ok).toBe(false);
  });

  it("aplica limites de tamanho", () => {
    expect(validateContact({ ...valid, name: "a".repeat(101) }).ok).toBe(false);
    expect(validateContact({ ...valid, message: "a".repeat(5001) }).ok).toBe(false);
  });

  it("rejeita tipos não-string", () => {
    expect(validateContact({ ...valid, message: 123 }).ok).toBe(false);
  });
});

describe("token de tempo mínimo", () => {
  it("aceita token autêntico dentro da janela", () => {
    expect(verifyFormToken(token, SECRET, T0 + 5_000)).toBe("ok");
  });
  it("recusa envio rápido demais", () => {
    expect(verifyFormToken(token, SECRET, T0 + 1_000)).toBe("too_fast");
  });
  it("recusa token expirado", () => {
    expect(verifyFormToken(token, SECRET, T0 + 3 * 60 * 60 * 1000)).toBe("expired");
  });
  it("recusa assinatura adulterada ou segredo diferente", () => {
    expect(verifyFormToken(`${T0 - 60_000}.${token.split(".")[1]}`, SECRET, T0 + 5_000)).toBe("invalid");
    expect(verifyFormToken(token, "outro", T0 + 5_000)).toBe("invalid");
    expect(verifyFormToken("lixo", SECRET, T0)).toBe("invalid");
    expect(verifyFormToken(undefined, SECRET, T0)).toBe("invalid");
  });
});

describe("rate limit", () => {
  it("bloqueia após o limite e libera depois da janela", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(rl.check("a", 0).ok).toBe(true);
    expect(rl.check("a", 10).ok).toBe(true);
    const third = rl.check("a", 20);
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.retryAfterSec).toBeGreaterThanOrEqual(1);
    expect(rl.check("b", 20).ok).toBe(true);
    expect(rl.check("a", 1500).ok).toBe(true);
  });

  it("extrai o IP do primeiro x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(clientIp(new Headers())).toBe("anon");
  });
});

describe("config", () => {
  it("exige variáveis obrigatórias", () => {
    const r = readContactConfig({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.missing).toEqual(["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "CONTACT_FORM_SECRET"]);
  });
  it("usa defaults de destino, remetente e TLS", () => {
    const r = readContactConfig({ ...ENV, SMTP_PORT: "465" });
    expect(r.ok && r.config).toMatchObject({ to: "mufforigem@gmail.com", from: "bot@example.com", secure: true, port: 465 });
  });
  it("recusa CONTACT_FROM com quebra de linha", () => {
    expect(readContactConfig({ ...ENV, CONTACT_FROM: "a@b.c\nBcc: x@y.z" }).ok).toBe(false);
  });
});

describe("buildMail", () => {
  it("monta texto puro com reply-to do remetente", () => {
    const cfg = readContactConfig(ENV);
    if (!cfg.ok) throw new Error("cfg");
    const v = validateContact(valid);
    if (!v.ok) throw new Error("v");
    const m = buildMail(cfg.config, v.value, { ip: "1.2.3.4", at: new Date(T0) });
    expect(m.to).toBe("mufforigem@gmail.com");
    expect(m.replyTo).toEqual({ name: "Ana Souza", address: "ana@example.com" });
    expect(m.subject).toBe("[C-STAR] Parceria: Ana Souza");
    expect(m.text).toContain(valid.message);
  });
});

describe("handler", () => {
  it("GET devolve 503 sem configuração e token quando configurado", async () => {
    const off = handleContactGet({ env: {} });
    expect(off.status).toBe(503);
    expect(await off.json()).toEqual({ error: "envio_indisponivel" });
    const on = handleContactGet({ env: ENV, now: () => T0 });
    expect(on.status).toBe(200);
    expect((await on.json()).token).toBe(token);
  });

  it("POST sem SMTP configurado responde 503 e não envia", async () => {
    const { d, send } = deps({ env: {} });
    const res = await handleContactPost(post({ ...valid, token }), d);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "envio_indisponivel" });
    expect(send).not.toHaveBeenCalled();
  });

  it("envia e responde 200 com dados válidos", async () => {
    const { d, send } = deps();
    const res = await handleContactPost(post({ ...valid, website: "", token }), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledOnce();
  });

  it("recusa honeypot preenchido", async () => {
    const { d, send } = deps();
    const res = await handleContactPost(post({ ...valid, website: "http://spam", token }), d);
    expect(res.status).toBe(422);
    expect(send).not.toHaveBeenCalled();
  });

  it("devolve erros por campo", async () => {
    const { d } = deps();
    const res = await handleContactPost(post({ ...valid, email: "nope", token }), d);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("dados_invalidos");
    expect(body.fields.email).toBeTruthy();
  });

  it("recusa envio rápido demais e token ausente", async () => {
    const fast = deps({ now: () => T0 + 500 });
    expect((await (await handleContactPost(post({ ...valid, token }), fast.d)).json()).error).toBe("rapido_demais");
    const { d } = deps();
    expect((await (await handleContactPost(post(valid), d)).json()).error).toBe("token_invalido");
  });

  it("valida content-type, JSON e tamanho", async () => {
    const { d } = deps();
    expect((await handleContactPost(post("{", {}), d)).status).toBe(400);
    expect((await handleContactPost(post(valid, { "content-type": "text/plain" }), d)).status).toBe(415);
    expect((await handleContactPost(post({ ...valid, message: "a".repeat(20_000), token }), d)).status).toBe(413);
  });

  it("aplica rate limit por IP", async () => {
    const { d } = deps({ limiter: createRateLimiter({ limit: 1 }) });
    expect((await handleContactPost(post({ ...valid, token }), d)).status).toBe(200);
    const res = await handleContactPost(post({ ...valid, token }), d);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
  });

  it("falha de SMTP vira 502 (nunca sucesso simulado)", async () => {
    const send = vi.fn<SendMail>(async () => {
      throw new Error("ECONNREFUSED");
    });
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { d } = deps({ send });
    const res = await handleContactPost(post({ ...valid, token }), d);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "falha_envio" });
    err.mockRestore();
  });
});
