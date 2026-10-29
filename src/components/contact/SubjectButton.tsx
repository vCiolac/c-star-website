"use client";

import type { ContactSubject } from "@/content/contact";
import { SUBJECT_EVENT } from "./ContactForm";

/** Pré-seleciona o assunto no formulário e leva o foco até ele. */
export function SubjectButton({ subject, children }: { subject: ContactSubject; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(SUBJECT_EVENT, { detail: subject }));
        const form = document.getElementById("formulario");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        form?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        window.setTimeout(() => form?.querySelector<HTMLInputElement>("input[name='name']")?.focus({ preventScroll: true }), reduce ? 0 : 500);
      }}
    >
      {children} <span aria-hidden>↓</span>
    </button>
  );
}
