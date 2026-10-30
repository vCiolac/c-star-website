import Link from "next/link";
import { AreaVisual } from "@/components/contact/AreaVisual";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { contactAreas } from "@/content/contact";
import styles from "./ContactTeaser.module.css";

/** Seção de contato da Home: apresenta as áreas e leva para /contato. */
export function ContactTeaser() {
  return (
    <section id="contato" className={`section ${styles.section}`} aria-labelledby="contato-title">
      <div className="wrap">
        <div className={styles.head}>
          <span className="label">Contato</span>
          <h2 id="contato-title" className="t-1">
            Tem um mundo para construir com a gente?
          </h2>
          <p className="lead">Parcerias, imprensa ou oportunidades: escolha o assunto e escreva para o estúdio.</p>
        </div>

        <ScrollReveal className={styles.areas} itemSelector="[data-area]">
          {contactAreas.map((a) => (
            <Link key={a.id} href={`/contato#${a.id}`} className={styles.area} data-area>
              <AreaVisual visual={a.visual} color={a.color} className={styles.visual} />
              <span className={`label ${styles.kicker}`} data-color={a.color}>
                {a.kicker}
              </span>
              <span className={`t-3 ${styles.areaTitle}`}>{a.title}</span>
              <span className={styles.areaCta}>
                {a.cta} <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </ScrollReveal>

        <div className={styles.bottom}>
          <Link className="btn btn-gold" href="/contato#formulario">
            Entre em contato
          </Link>
        </div>
      </div>
    </section>
  );
}
