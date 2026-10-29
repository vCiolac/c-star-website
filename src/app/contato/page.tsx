import type { Metadata } from "next";
import { AreaVisual } from "@/components/contact/AreaVisual";
import { ContactForm } from "@/components/contact/ContactForm";
import { SubjectButton } from "@/components/contact/SubjectButton";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { PageIntro } from "@/components/ui/PageIntro";
import { contactAreas } from "@/content/contact";
import styles from "./contato.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a C-STAR Studios sobre parcerias, imprensa ou oportunidades. Formulário de contato e e-mail oficial do estúdio.",
  alternates: { canonical: "/contato" },
  openGraph: { title: "Contato · C-STAR Studios", url: "/contato" }
};

export default function ContatoPage() {
  return (
    <main>
      <PageIntro
        kicker="Contato · Parcerias · Imprensa · Oportunidades"
        title="Vamos conversar sobre mundos."
        lead="Somos um estúdio pequeno e lemos cada mensagem. Escolha a área que combina com o seu assunto ou vá direto ao formulário."
      >
        <CopyEmail />
      </PageIntro>

      <div className={styles.areas}>
        {contactAreas.map((a, i) => (
          <section
            key={a.id}
            id={a.id}
            className={styles.area}
            data-flip={i % 2 === 1 ? "true" : undefined}
            aria-labelledby={`${a.id}-title`}
          >
            <div className={`wrap ${styles.areaGrid}`}>
              <AreaVisual visual={a.visual} color={a.color} className={styles.visual} />
              <ScrollReveal className={styles.areaCopy} itemSelector="[data-r]">
                <span className={`label ${styles.kicker}`} data-color={a.color} data-r>
                  {String(i + 1).padStart(2, "0")} · {a.kicker}
                </span>
                <h2 id={`${a.id}-title`} className="t-1" data-r>
                  {a.title}
                </h2>
                <p className="lead" data-r>
                  {a.text}
                </p>
                <ul className={styles.points} data-r>
                  {a.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div data-r>
                  <SubjectButton subject={a.subject}>{a.cta}</SubjectButton>
                </div>
              </ScrollReveal>
            </div>
          </section>
        ))}
      </div>

      <section id="formulario" className={`section ${styles.formSection}`} aria-labelledby="form-title">
        <div className={`wrap ${styles.formGrid}`}>
          <div className={styles.formAside}>
            <span className="label accent-gold">Formulário</span>
            <h2 id="form-title" className="t-1">
              Escreva para o estúdio.
            </h2>
            <p className="prose-muted">
              A mensagem chega direto no e-mail da equipe. Se preferir, escreva para o endereço oficial: a resposta vem do
              mesmo lugar.
            </p>
            <CopyEmail />
          </div>
          <div className={styles.formCard}>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
