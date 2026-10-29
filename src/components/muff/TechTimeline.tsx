"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { techSteps, type TechStep } from "@/content/muff";
import { loadGsap } from "@/lib/gsap";
import { siteLinks } from "@/lib/siteContent";
import styles from "./TechTimeline.module.css";

function Visual({ step }: { step: TechStep }) {
  switch (step.visual) {
    case "legacy":
    case "today":
      return step.image ? (
        <div className={styles.pv}>
          <Image src={step.image.image} alt={step.image.alt} fill sizes="(min-width: 900px) 380px, 90vw" placeholder="blur" />
          <span className={styles.cap}>{step.visual === "legacy" ? "Cliente Godot · legado" : "Versão de desenvolvimento"}</span>
        </div>
      ) : null;
    case "stack":
      return (
        <div className={styles.pv}>
          <div className={styles.chips} role="img" aria-label="Godot, .NET e MySQL substituídos por TypeScript, Node, PostgreSQL e Phaser">
            <span className={styles.old}>Godot</span>
            <span className={styles.old}>.NET</span>
            <span className={styles.old}>MySQL</span>
            <span className={styles.arrow} aria-hidden>
              ↓
            </span>
            <span className={styles.new}>TypeScript</span>
            <span className={styles.new}>Node</span>
            <span className={styles.new}>PostgreSQL</span>
            <span className={styles.new}>Phaser</span>
          </div>
        </div>
      );
    case "server":
      return (
        <div className={styles.pv}>
          <svg className={styles.diag} viewBox="0 0 320 220" role="img" aria-label="Diagrama: o navegador conversa com o servidor Node autoritativo, que grava no PostgreSQL">
            <g fill="none" stroke="rgba(148,163,184,.35)">
              <rect x="14" y="86" width="88" height="48" rx="10" />
              <rect x="126" y="76" width="96" height="68" rx="12" stroke="#38bdf8" />
              <rect x="244" y="86" width="64" height="48" rx="10" stroke="#fbbf24" />
            </g>
            <g stroke="#38bdf8" strokeDasharray="3 4">
              <path d="M102 104 H126" />
              <path d="M126 118 H102" />
            </g>
            <path d="M222 110 H244" stroke="#fbbf24" />
            <text x="58" y="114" textAnchor="middle">Navegador</text>
            <text x="174" y="106" textAnchor="middle">Node</text>
            <text x="174" y="124" textAnchor="middle" className={styles.sm}>
              autoritativo
            </text>
            <text x="276" y="108" textAnchor="middle">Postgre</text>
            <text x="276" y="122" textAnchor="middle">SQL</text>
            <text x="160" y="46" textAnchor="middle" className={styles.sm}>
              WebSocket · HTTP
            </text>
          </svg>
        </div>
      );
    case "sprites":
      return (
        <div className={`${styles.pv} ${styles.beach}`}>
          <Sprite src="/sprites/umay_walk_east.png" frames={8} size={88} label="Sprite de Umay caminhando" className={styles.sprL} />
          <Sprite src="/sprites/caranga_walk_west.png" frames={8} size={72} label="Sprite de Caranga caminhando" className={styles.sprR} />
          <span className={styles.cap}>Sprites reais · Umay e Caranga</span>
        </div>
      );
  }
}

/**
 * Linha do tempo "Do Godot ao navegador". Desktop: trilho horizontal fixado (scrub).
 * Mobile / movimento reduzido: lista vertical.
 */
export function TechTimeline() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!root || !track || !strip) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia(root);
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        root.dataset.mode = "h";
        const dist = () => Math.max(0, strip.scrollWidth - document.documentElement.clientWidth);
        const setH = () => {
          track.style.height = `${window.innerHeight + dist()}px`;
        };
        setH();
        const tween = gsap.fromTo(
          strip,
          { x: 0 },
          {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.5,
              invalidateOnRefresh: true,
              onRefreshInit: setH
            }
          }
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          delete root.dataset.mode;
          track.style.height = "";
        };
      });
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section ref={rootRef} id="evolucao" className={styles.root} aria-labelledby="evolucao-title">
      <div ref={trackRef} className={styles.track}>
        <div className={styles.stage}>
          <div className={`wrap section-head ${styles.head}`}>
            <span className="label">Evolução tecnológica · estudo de caso</span>
            <h2 id="evolucao-title" className="t-1">
              Do Godot ao navegador.
            </h2>
            <p className="lead">Como um jogo de PC virou um mundo que abre com um link, sem perder o que já existia.</p>
          </div>
          <ol ref={stripRef} className={styles.strip}>
            {techSteps.map((s) => (
              <li key={s.id} className={styles.panel}>
                <div className={styles.text}>
                  <span className={styles.num}>
                    {s.index} · {s.tag}
                  </span>
                  <h3 className="t-2">{s.title}</h3>
                  <p>{s.text}</p>
                  {s.visual === "today" ? (
                    <a className="btn btn-ghost btn-sm" href={siteLinks.play} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16 }}>
                      Abrir a versão de desenvolvimento <span aria-hidden>↗</span>
                      <span className="sr-only">(abre em nova aba)</span>
                    </a>
                  ) : null}
                </div>
                <Visual step={s} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
