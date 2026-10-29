export type ContactConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
  from: string;
  secret: string;
};

type Env = Record<string, string | undefined>;

const REQUIRED = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "CONTACT_FORM_SECRET"] as const;
const ADDRESS = /^[^\s@<>"\r\n]+@[^\s@<>"\r\n]+$/;

/** Lê a configuração de envio. Sem as variáveis obrigatórias, o envio fica indisponível (503). */
export function readContactConfig(env: Env): { ok: true; config: ContactConfig } | { ok: false; missing: string[] } {
  const missing: string[] = REQUIRED.filter((k) => !env[k]?.trim());
  if (missing.length) return { ok: false, missing };

  const port = Number(env.SMTP_PORT?.trim() || 587);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return { ok: false, missing: ["SMTP_PORT"] };
  const secure = env.SMTP_SECURE?.trim() ? /^(1|true|yes)$/i.test(env.SMTP_SECURE.trim()) : port === 465;

  const user = env.SMTP_USER!.trim();
  const to = env.CONTACT_TO?.trim() || "mufforigem@gmail.com";
  const from = env.CONTACT_FROM?.trim() || user;
  if (!ADDRESS.test(to)) return { ok: false, missing: ["CONTACT_TO"] };
  // CONTACT_FROM pode ser "Nome <email>"; só não pode ter quebra de linha.
  if (/[\r\n]/.test(from)) return { ok: false, missing: ["CONTACT_FROM"] };

  return {
    ok: true,
    config: { host: env.SMTP_HOST!.trim(), port, secure, user, pass: env.SMTP_PASS!, to, from, secret: env.CONTACT_FORM_SECRET! }
  };
}
