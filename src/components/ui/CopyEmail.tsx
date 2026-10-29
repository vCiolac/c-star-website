"use client";

import { useState } from "react";
import { siteLinks } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import styles from "./CopyEmail.module.css";

/** E-mail oficial com botão de copiar (feedback anunciado via aria-live). */
export function CopyEmail({ className }: { className?: string }) {
  const [msg, setMsg] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(siteLinks.contactEmail);
      setMsg("E-mail copiado.");
    } catch {
      setMsg("Não foi possível copiar. Selecione o endereço manualmente.");
    }
  }

  return (
    <div className={cn(styles.root, className)}>
      <a className={styles.mail} href={siteLinks.contactMailto}>
        {siteLinks.contactEmail}
      </a>
      <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
        Copiar e-mail
      </button>
      <span className={styles.msg} role="status" aria-live="polite">
        {msg}
      </span>
    </div>
  );
}
