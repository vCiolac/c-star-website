"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CONTACT_SUBJECTS, type ContactSubject } from "@/content/contact";
import { CONTACT_LIMITS, validateContact, type ContactField, type FieldErrors } from "@/lib/contact/schema";
import { siteLinks } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import styles from "./ContactForm.module.css";

export const SUBJECT_EVENT = "cstar:subject";

type Availability = "checking" | "ready" | "unavailable";
type Status = "idle" | "sending" | "success" | "error";

const SUBJECT_LABEL: Record<ContactSubject, string> = {
  Parceria: "Parceria",
  Imprensa: "Imprensa",
  Oportunidade: "Oportunidade",
  Outro: "Outro"
};

const ORDER: ContactField[] = ["name", "email", "subject", "message"];

const SERVER_MESSAGES: Record<string, string> = {
  muitas_tentativas: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.",
  rapido_demais: "Envio rápido demais. Aguarde alguns segundos e clique em enviar novamente.",
  token_expirado: "O formulário ficou aberto por muito tempo. Atualizamos a sessão: envie novamente.",
  token_invalido: "Não foi possível validar o formulário. Atualizamos a sessão: envie novamente.",
  rejeitado: "Não foi possível enviar a mensagem.",
  formato_invalido: "Não foi possível enviar a mensagem.",
  corpo_grande: "A mensagem está grande demais.",
  falha_envio: "O servidor de e-mail não respondeu. Tente de novo em instantes ou escreva direto para o e-mail oficial.",
  envio_indisponivel: "O envio pelo site está indisponível no momento."
};

function isSubject(v: string | null): v is ContactSubject {
  return !!v && (CONTACT_SUBJECTS as readonly string[]).includes(v);
}

/** Formulário de contato real (POST /api/contact). Nunca simula sucesso. */
export function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState({ name: "", email: "", subject: "Parceria" as ContactSubject, message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [availability, setAvailability] = useState<Availability>("checking");
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const tokenRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/contact", { cache: "no-store" });
      if (res.status === 503) {
        setAvailability("unavailable");
        return;
      }
      const data = (await res.json()) as { token?: string };
      if (!res.ok || !data.token) throw new Error("token");
      tokenRef.current = data.token;
      setAvailability("ready");
    } catch {
      setAvailability("unavailable");
    }
  }, []);

  useEffect(() => {
    fetchToken();
    const qs = new URLSearchParams(window.location.search).get("assunto");
    if (isSubject(qs)) setValues((v) => ({ ...v, subject: qs }));
    const onSubject = (e: Event) => {
      const s = (e as CustomEvent<string>).detail;
      if (isSubject(s)) setValues((v) => ({ ...v, subject: s }));
    };
    window.addEventListener(SUBJECT_EVENT, onSubject);
    return () => window.removeEventListener(SUBJECT_EVENT, onSubject);
  }, [fetchToken]);

  const id = (f: string) => `${uid}-${f}`;

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as ContactField]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function focusField(f: ContactField) {
    const el =
      f === "subject"
        ? formRef.current?.querySelector<HTMLInputElement>(`input[name="subject"]:checked, input[name="subject"]`)
        : formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(f))}`);
    el?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const v = validateContact(values);
    if (!v.ok) {
      setErrors(v.fields);
      const n = Object.keys(v.fields).length;
      setStatus("error");
      setStatusMsg(n === 1 ? "Corrija o campo destacado." : `Corrija os ${n} campos destacados.`);
      const first = ORDER.find((f) => v.fields[f]);
      if (first) focusField(first);
      return;
    }
    if (availability !== "ready" || !tokenRef.current) {
      setStatus("error");
      setStatusMsg(SERVER_MESSAGES.envio_indisponivel);
      return;
    }

    setStatus("sending");
    setStatusMsg("Enviando mensagem…");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...v.value, website: honeypotRef.current?.value ?? "", token: tokenRef.current })
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors };
      if (res.ok && data.ok) {
        setStatus("success");
        setStatusMsg("Mensagem enviada.");
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }
      if (res.status === 503 || data.error === "envio_indisponivel") setAvailability("unavailable");
      if (data.error === "dados_invalidos" && data.fields) {
        setErrors(data.fields);
        const first = ORDER.find((f) => data.fields?.[f]);
        if (first) focusField(first);
        setStatus("error");
        setStatusMsg("Corrija os campos destacados.");
        return;
      }
      if (data.error === "token_expirado" || data.error === "token_invalido") await fetchToken();
      setStatus("error");
      setStatusMsg(SERVER_MESSAGES[data.error ?? ""] ?? "Não foi possível enviar a mensagem.");
    } catch {
      setStatus("error");
      setStatusMsg("Sem conexão com o servidor. Verifique sua internet ou escreva para o e-mail oficial.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success}>
        <h3 ref={successRef} tabIndex={-1} className="t-2">
          Mensagem enviada. Obrigado!
        </h3>
        <p>
          Recebemos seu contato sobre <b>{SUBJECT_LABEL[values.subject].toLowerCase()}</b>. Vamos responder no e-mail{" "}
          <b>{values.email}</b>.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setValues((v) => ({ ...v, message: "" }));
            setStatus("idle");
            setStatusMsg("");
            fetchToken();
          }}
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  const disabled = status === "sending";
  const describe = (f: ContactField, extra?: string) =>
    [errors[f] ? id(`${f}-err`) : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-describedby={id("intro")}>
      <p id={id("intro")} className={styles.hint}>
        Todos os campos são obrigatórios.
      </p>

      {availability === "unavailable" ? (
        <div className={styles.notice} role="status">
          <b>O envio pelo site está indisponível no momento.</b>
          <span>
            Escreva direto para{" "}
            <a href={`${siteLinks.contactMailto}?subject=${encodeURIComponent(`[C-STAR] ${values.subject}`)}`}>
              {siteLinks.contactEmail}
            </a>
            . Respondemos por lá.
          </span>
        </div>
      ) : null}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={id("name")}>Nome</label>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            maxLength={CONTACT_LIMITS.nameMax}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describe("name")}
          />
          {errors.name ? (
            <span id={id("name-err")} className={styles.err}>
              {errors.name}
            </span>
          ) : null}
        </div>
        <div className={styles.field}>
          <label htmlFor={id("email")}>E-mail</label>
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={CONTACT_LIMITS.emailMax}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describe("email")}
          />
          {errors.email ? (
            <span id={id("email-err")} className={styles.err}>
              {errors.email}
            </span>
          ) : null}
        </div>
      </div>

      <fieldset className={styles.fieldset} aria-invalid={!!errors.subject} aria-describedby={describe("subject")}>
        <legend>Assunto</legend>
        <div className={styles.chips}>
          {CONTACT_SUBJECTS.map((s) => (
            <label key={s} className={cn(styles.chip, values.subject === s && styles.chipOn)}>
              <input
                type="radio"
                name="subject"
                value={s}
                checked={values.subject === s}
                onChange={() => update("subject", s)}
              />
              {SUBJECT_LABEL[s]}
            </label>
          ))}
        </div>
        {errors.subject ? (
          <span id={id("subject-err")} className={styles.err}>
            {errors.subject}
          </span>
        ) : null}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor={id("message")}>Mensagem</label>
        <textarea
          id={id("message")}
          name="message"
          rows={7}
          required
          maxLength={CONTACT_LIMITS.messageMax}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={describe("message", id("count"))}
        />
        <div className={styles.under}>
          {errors.message ? (
            <span id={id("message-err")} className={styles.err}>
              {errors.message}
            </span>
          ) : (
            <span />
          )}
          <span id={id("count")} className={styles.count}>
            {values.message.length}/{CONTACT_LIMITS.messageMax}
          </span>
        </div>
      </div>

      {/* Honeypot: invisível para pessoas e leitores de tela. */}
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor={id("website")}>Não preencha este campo</label>
        <input ref={honeypotRef} id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btn-gold" disabled={disabled || availability === "checking"}>
          {status === "sending" ? "Enviando…" : "Enviar mensagem"}
        </button>
        <p
          className={cn(styles.status, status === "error" && styles.statusErr)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {statusMsg}
          {status === "error" && (statusMsg === SERVER_MESSAGES.envio_indisponivel || /e-mail oficial/.test(statusMsg)) ? (
            <>
              {" "}
              <a href={siteLinks.contactMailto}>{siteLinks.contactEmail}</a>
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
