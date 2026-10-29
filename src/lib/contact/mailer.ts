import type { ContactConfig } from "./config";
import type { ContactInput } from "./schema";

export type MailMessage = {
  from: string;
  to: string;
  replyTo: { name: string; address: string };
  subject: string;
  text: string;
};

export type SendMail = (config: ContactConfig, message: MailMessage) => Promise<void>;

/** Monta a mensagem em texto puro. Nome e e-mail já chegam validados, sem quebras de linha. */
export function buildMail(config: ContactConfig, input: ContactInput, meta: { ip: string; at: Date }): MailMessage {
  const safeName = input.name.replace(/[\r\n\u2028\u2029]+/g, " ").slice(0, 100);
  return {
    from: config.from,
    to: config.to,
    replyTo: { name: safeName, address: input.email },
    subject: `[C-STAR] ${input.subject}: ${safeName}`.slice(0, 160),
    text: [
      `Assunto: ${input.subject}`,
      `Nome: ${safeName}`,
      `E-mail: ${input.email}`,
      "",
      input.message,
      "",
      "--",
      `Enviado pelo formulário do site da C-STAR Studios em ${meta.at.toISOString()} (IP ${meta.ip}).`
    ].join("\n")
  };
}

/** Envio real via SMTP (nodemailer carregado sob demanda, só no servidor). */
export const sendWithSmtp: SendMail = async (config, message) => {
  const { createTransport } = await import("nodemailer");
  const transport = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });
  await transport.sendMail(message);
};
