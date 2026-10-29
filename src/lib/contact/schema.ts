import { z } from "zod";
import { CONTACT_SUBJECTS } from "@/content/contact";

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 5000,
  /** Tamanho máximo do corpo JSON aceito (bytes). */
  bodyMax: 16 * 1024
} as const;

const LINE_BREAK = /[\r\n\u2028\u2029]/;
// Caracteres de controle, exceto \t e \n (permitidos só na mensagem).
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const noLineBreaks = (v: string) => !LINE_BREAK.test(v);
const stripControl = (v: string) => v.replace(CONTROL, "");

export const contactSchema = z.object({
  name: z
    .string({ error: "Informe seu nome." })
    .refine(noLineBreaks, "O nome não pode ter quebras de linha.")
    .transform((v) => stripControl(v).trim())
    .pipe(
      z
        .string()
        .min(CONTACT_LIMITS.nameMin, "Informe seu nome.")
        .max(CONTACT_LIMITS.nameMax, `Use no máximo ${CONTACT_LIMITS.nameMax} caracteres.`)
    ),
  email: z
    .string({ error: "Informe seu e-mail." })
    .refine(noLineBreaks, "Informe um e-mail válido.")
    .transform((v) => v.trim())
    .pipe(z.string().max(CONTACT_LIMITS.emailMax, "E-mail longo demais.").pipe(z.email("Informe um e-mail válido."))),
  subject: z.enum(CONTACT_SUBJECTS, { error: "Escolha um assunto." }),
  message: z
    .string({ error: "Escreva sua mensagem." })
    .transform((v) => stripControl(v).trim())
    .pipe(
      z
        .string()
        .min(CONTACT_LIMITS.messageMin, `Escreva pelo menos ${CONTACT_LIMITS.messageMin} caracteres.`)
        .max(CONTACT_LIMITS.messageMax, `Use no máximo ${CONTACT_LIMITS.messageMax} caracteres.`)
    )
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;
export type FieldErrors = Partial<Record<ContactField, string>>;

export function validateContact(
  data: unknown
): { ok: true; value: ContactInput } | { ok: false; fields: FieldErrors } {
  const r = contactSchema.safeParse(data);
  if (r.success) return { ok: true, value: r.data };
  const fields: FieldErrors = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as ContactField | undefined;
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return { ok: false, fields };
}
