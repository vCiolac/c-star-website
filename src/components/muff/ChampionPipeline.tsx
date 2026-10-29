import Image from "next/image";
import terminal from "@/assets/muff/terminal.webp";
import tyrone from "@/assets/muff/champ/tyrone-full.webp";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { Sprite } from "@/components/ui/Sprite";
import { championPipeline } from "@/content/muff";
import { team } from "@/lib/siteContent";
import styles from "./ChampionPipeline.module.css";

const COLOR = { victor: "#38bdf8", juan: "#fbbf24", rodrigo: "#fb7185" } as const;
const BARS = Array.from({ length: 28 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21)));

/** Estudo de caso: como um campeão atravessa as três mesas (ideia → kit/IA → voz, som e mundo). */
export function ChampionPipeline() {
  return (
    <section id="processo" className="section" aria-labelledby="processo-title">
      <div className="wrap">
        <div className="section-head">
          <span className="label">Processo criativo · estudo de caso</span>
          <h2 id="processo-title" className="t-1">
            Um campeão atravessa as três mesas.
          </h2>
          <p className="lead">
            Do primeiro rascunho ao momento em que entra na caçada, cada campeão passa pelas mãos dos três criadores.
          </p>
        </div>

        <ScrollReveal className={styles.steps} itemSelector="[data-step]">
          {championPipeline.map((s, i) => {
            const member = team.find((m) => m.id === s.member)!;
            return (
              <article key={s.member} data-step className={styles.step} style={{ "--c": COLOR[s.member] } as React.CSSProperties}>
                <figure className={styles.fig}>
                  {i === 0 ? (
                    <Image src={tyrone} alt="Tyrone, campeão ruivo com foice, arte de corpo inteiro" sizes="(min-width: 900px) 30vw, 80vw" placeholder="blur" className={styles.art} />
                  ) : null}
                  {i === 1 ? (
                    <div className={styles.term}>
                      <Image src={terminal} alt="Mesa de sucata com monitor CRT, o computador da casa em MUFF" fill sizes="(min-width: 900px) 30vw, 90vw" placeholder="blur" />
                      <div className={styles.crt}>
                        <div className={styles.walker}>
                          <Sprite src="/sprites/walk12_tyrone.png" frames={11} size={56} label="Sprite de Tyrone caminhando" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {i === 2 ? (
                    <div className={styles.wave} role="img" aria-label="Forma de onda ilustrativa de música e efeitos sonoros">
                      {BARS.map((h, k) => (
                        <span key={k} style={{ "--h": h.toFixed(3), animationDelay: `${(k % 7) * -0.18}s` } as React.CSSProperties} />
                      ))}
                    </div>
                  ) : null}
                </figure>
                <span className={`label ${styles.stepLabel}`}>
                  {String(i + 1).padStart(2, "0")} · {s.label} · {member.shortName}
                </span>
                <h3 className="t-3">{s.title}</h3>
                <p className={styles.text}>{s.text}</p>
              </article>
            );
          })}
        </ScrollReveal>
        <p className={styles.note}>Exemplo ilustrativo. Na prática, as etapas se sobrepõem e os três participam de todas.</p>
      </div>
    </section>
  );
}
