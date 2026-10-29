"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { chapters } from "@/content/muff";
import { loadGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import styles from "./MuffChapters.module.css";

/** Pontos de progresso onde cada capítulo está totalmente em cena. */
const STOPS = [0.12, 0.52, 0.9];

/**
 * Sequência cinematográfica em capítulos: arte e texto mudam juntos.
 * Desktop (≥900px, sem movimento reduzido): seção fixada com scrub.
 * Mobile / movimento reduzido: capítulos empilhados, cada um com sua arte.
 */
export function MuffChapters() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<{ start: number; end: number } | null>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia(root);
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        setPinned(true);
        const q = gsap.utils.selector(root);
        const layers = q("[data-layer]");
        const panels = q("[data-panel]");
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 30 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              stRef.current = { start: self.start, end: self.end };
              const p = self.progress;
              setActive(p < 0.34 ? 0 : p < 0.7 ? 1 : 2);
            },
            onRefresh: (self) => {
              stRef.current = { start: self.start, end: self.end };
            }
          }
        });
        tl.fromTo(layers[0].querySelector("img"), { scale: 1.02 }, { scale: 1.12, duration: 1 }, 0)
          .fromTo(layers[1], { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.16, ease: "power2.inOut" }, 0.26)
          .fromTo(layers[1].querySelector("img"), { xPercent: 6 }, { xPercent: 0, duration: 0.5 }, 0.26)
          .fromTo(layers[2], { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.16, ease: "power2.inOut" }, 0.62)
          .fromTo(layers[2].querySelectorAll("[data-cast]"), { yPercent: 18, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.18, stagger: 0.03, ease: "power2.out" }, 0.68)
          .to(panels[0], { autoAlpha: 0, y: -30, duration: 0.08 }, 0.26)
          .to(panels[1], { autoAlpha: 1, y: 0, duration: 0.08 }, 0.36)
          .to(panels[1], { autoAlpha: 0, y: -30, duration: 0.08 }, 0.62)
          .to(panels[2], { autoAlpha: 1, y: 0, duration: 0.08 }, 0.72);

        return () => {
          setPinned(false);
          setActive(0);
          stRef.current = null;
        };
      });
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  function goTo(i: number) {
    const st = stRef.current;
    if (!st) return;
    const top = st.start + STOPS[i] * (st.end - st.start);
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <section
      ref={rootRef}
      className={styles.root}
      data-mode={pinned ? "pinned" : "static"}
      aria-labelledby="chapters-title"
    >
      <h2 id="chapters-title" className="sr-only">
        O universo de MUFF em três capítulos
      </h2>
      <div ref={trackRef} className={styles.track}>
        <div className={styles.stage}>
          {chapters.map((c, i) => (
            <div key={c.id} className={styles.chapter}>
              <figure data-layer className={cn(styles.layer, c.cast && styles.layerCast)}>
                <Image
                  src={c.background.image}
                  alt={c.background.alt}
                  fill
                  sizes="100vw"
                  placeholder="blur"
                  className={styles.bg}
                />
                {c.cast ? (
                  <div className={styles.cast}>
                    {c.cast.map((a) => (
                      <div key={a.alt} data-cast className={styles.castItem}>
                        <Image src={a.image} alt={a.alt} sizes="(min-width: 900px) 22vw, 30vw" placeholder="blur" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </figure>
              <article data-panel className={styles.panel} aria-labelledby={`ch-${c.id}`}>
                <div className="wrap">
                  <div className={styles.panelInner}>
                    <span className="label accent-gold">Capítulo {c.index}</span>
                    <h3 id={`ch-${c.id}`} className="t-1">
                      {c.title}
                    </h3>
                    <p className={styles.line}>{c.line}</p>
                    <p className={styles.body}>{c.body}</p>
                  </div>
                </div>
              </article>
              {i === 0 ? <div className={styles.shade} aria-hidden="true" /> : null}
            </div>
          ))}

          <nav className={styles.indicators} aria-label="Capítulos">
            <ol>
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active === i ? "step" : undefined}
                    className={styles.indicator}
                  >
                    <span className={styles.indNum}>{c.index}</span>
                    <span>{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
