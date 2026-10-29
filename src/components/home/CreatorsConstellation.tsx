"use client";

import { useEffect, useRef } from "react";
import { StarMark } from "@/components/ui/StarMark";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import { team } from "@/lib/siteContent";
import styles from "./CreatorsConstellation.module.css";

const COLORS = { portal: "#38bdf8", gold: "#fbbf24", rose: "#fb7185" } as const;
/** Posição das estrelas na faixa do céu (viewBox 300×100). */
const SKY = [
  { x: 50, y: 20 },
  { x: 150, y: 76 },
  { x: 250, y: 36 }
];

type Props = {
  title?: string;
  intro?: string;
  headingLevel?: "h2" | "h3";
  id?: string;
};

/**
 * "Três estrelas, uma constelação": os três criadores como estrelas ligadas.
 * Desktop: faixa de céu com as estrelas + três colunas alinhadas (sem sobreposição).
 * Mobile: lista vertical com uma linha-guia.
 */
export function CreatorsConstellation({
  title = "Três estrelas, uma constelação.",
  intro = "Cada um assina uma parte do MUFF, e nenhuma delas funciona sozinha. O universo nasce do design, vira sistema no código e ganha lugar e som no mundo.",
  headingLevel: H = "h2",
  id = "criadores"
}: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.querySelector("[data-sky]") ?? root, start: "top 80%", once: true } });
        tl.fromTo("[data-thread]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", stagger: 0.2 }, 0.2)
          .fromTo("[data-cstar]", { scale: 0.35, autoAlpha: 0.3 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(2.4)", stagger: 0.25 }, 0)
          .fromTo("[data-card]", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.15 }, 0.2);
      }, root);
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section ref={rootRef} id={id} className={`section ${styles.section}`} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <div className="section-head">
          <span className="label">Os criadores</span>
          <H id={`${id}-title`} className="t-1">
            {title}
          </H>
          <p className="lead">{intro}</p>
        </div>

        <div className={styles.sky} data-sky aria-hidden="true">
          <svg className={styles.threads} viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`${id}-thr`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset=".5" stopColor="#fbbf24" />
                <stop offset="1" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            {[
              [0, 1],
              [1, 2],
              [2, 0]
            ].map(([a, b]) => (
              <path
                key={`${a}${b}`}
                data-thread
                pathLength={1}
                d={`M${SKY[a].x} ${SKY[a].y} L${SKY[b].x} ${SKY[b].y}`}
                stroke={`url(#${id}-thr)`}
              />
            ))}
          </svg>
          {team.map((m, i) => (
            <span
              key={m.id}
              data-cstar
              className={styles.skyStar}
              style={{ left: `${(SKY[i].x / 300) * 100}%`, top: `${SKY[i].y}%`, color: COLORS[m.color] }}
            >
              <StarMark color={COLORS[m.color]} />
            </span>
          ))}
        </div>

        <ol className={styles.cards}>
          {team.map((m, i) => (
            <li
              key={m.id}
              data-card
              className={styles.card}
              style={{ "--c": COLORS[m.color], "--drop": `${Math.round(200 * (1 - SKY[i].y / 100)) + 8}px` } as React.CSSProperties}
            >
              <span className={styles.cardStar} aria-hidden="true">
                <StarMark color={COLORS[m.color]} />
              </span>
              <span className={`label ${styles.focus}`}>{m.focus}</span>
              <h3 className="t-2">{m.name}</h3>
              <p className={styles.role}>{m.role}</p>
              <p className={styles.text}>{m.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
