"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import confronto from "@/assets/muff/login-confronto.webp";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import { team } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { ConstellationScene, SceneState } from "./constellationScene";
import {
  clamp01,
  computeHeroLayout,
  easeInOutCubic,
  placeLabel,
  starPolygon,
  type HeroLayout
} from "./heroLayout";
import styles from "./HeroConstellation.module.css";

type GlMode = "pending" | "gl" | "nogl";

const HEADLINE: { text: string; accent?: boolean }[] = [
  { text: "Três" },
  { text: "criadores." },
  { text: "Um" },
  { text: "mundo" },
  { text: "para" },
  { text: "habitar.", accent: true }
];

const FRAME_MS = 1000 / 45;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hero da Home: constelação 3D dos três criadores (three.js, import dinâmico),
 * coreografia de entrada com GSAP, parallax de ponteiro e dolly no scroll que
 * termina numa revelação em máscara de estrela de 4 pontas para a arte do MUFF.
 */
export function HeroConstellation() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const fbLinesRef = useRef<SVGSVGElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [glMode, setGlMode] = useState<GlMode>("pending");
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const copy = copyRef.current;
    if (!track || !stage || !canvas || !copy) return;

    const reduced = prefersReducedMotion();
    const small = window.innerWidth < 760;
    const S: SceneState = reduced
      ? { reveal: 1, draw: 1, flare: 0.38, dolly: 0, ptrX: 0, ptrY: 0 }
      : { reveal: 0, draw: 0, flare: 0, dolly: 0, ptrX: 0, ptrY: 0 };
    const ptr = { x: 0, y: 0 };
    let progress = 0;
    let smooth = 0;
    let layout: HeroLayout | null = null;
    let scene: ConstellationScene | null = null;
    let mode: GlMode = "pending";
    let disposed = false;
    let running = false;
    let raf = 0;
    let last = 0;
    let visible = true;
    const labels = labelRefs.current.filter(Boolean) as HTMLSpanElement[];
    const revealImg = revealRef.current?.querySelector("img") ?? null;

    /* ---------------- layout ---------------- */
    function measure() {
      const sr = stage!.getBoundingClientRect();
      const cr = copy!.getBoundingClientRect();
      const labelW = Math.max(...labels.map((l) => l.offsetWidth), 120);
      const labelH = Math.max(...labels.map((l) => l.offsetHeight), 32);
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 68;
      layout = computeHeroLayout({
        width: sr.width,
        height: sr.height,
        headerH,
        copyTop: cr.top - sr.top,
        copyRight: cr.right - sr.left,
        labelW,
        labelH
      });
      scene?.setSize(sr.width, sr.height);
      scene?.setTargets(layout.stars, layout.center);
      drawFallback();
      positionLabels();
    }

    function drawFallback() {
      const svg = fbLinesRef.current;
      const fb = fallbackRef.current;
      if (!svg || !fb || !layout) return;
      const { stars, center } = layout;
      const w = stage!.clientWidth;
      const h = stage!.clientHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const tri = svg.querySelectorAll<SVGLineElement>("line");
      const segs: [number, number][] = [
        [0, 1],
        [1, 2],
        [2, 0]
      ];
      segs.forEach(([a, b], k) => {
        const l = tri[k];
        if (!l) return;
        l.setAttribute("x1", String(stars[a].x));
        l.setAttribute("y1", String(stars[a].y));
        l.setAttribute("x2", String(stars[b].x));
        l.setAttribute("y2", String(stars[b].y));
      });
      for (let k = 0; k < 3; k++) {
        const l = tri[3 + k];
        if (!l) continue;
        l.setAttribute("x1", String(stars[k].x));
        l.setAttribute("y1", String(stars[k].y));
        l.setAttribute("x2", String(center.x));
        l.setAttribute("y2", String(center.y));
      }
      fb.querySelectorAll<HTMLElement>("[data-fb-star]").forEach((el, k) => {
        const p = k < 3 ? stars[k] : center;
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`;
      });
      fb.style.transformOrigin = `${center.x}px ${center.y}px`;
    }

    function labelOpacity() {
      const fade = 1 - clamp01((progress - 0.08) / 0.18);
      return clamp01((S.draw - 0.3) / 0.5) * fade;
    }

    function positionLabels() {
      if (!layout) return;
      const op = labelOpacity();
      labels.forEach((el, i) => {
        const star = mode === "gl" && scene ? scene.project(i) : layout!.stars[i];
        if (!star) {
          el.style.opacity = "0";
          return;
        }
        const p = placeLabel(star, layout!.sides[i], layout!, el.offsetWidth, el.offsetHeight);
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
        el.style.opacity = op.toFixed(3);
      });
    }

    /* ---------------- scroll ---------------- */
    function applyScroll() {
      const p = progress;
      copy!.style.opacity = (1 - clamp01(p / 0.14)).toFixed(3);
      copy!.style.transform = `translate3d(0, ${(-p * 120).toFixed(1)}px, 0)`;
      copy!.style.visibility = p > 0.2 ? "hidden" : "visible";
      if (cueRef.current) cueRef.current.style.opacity = (1 - clamp01(p / 0.06)).toFixed(3);

      const reveal = revealRef.current;
      if (reveal) {
        const m = clamp01((p - 0.5) / 0.36);
        if (m <= 0) {
          reveal.style.visibility = "hidden";
        } else {
          reveal.style.visibility = "visible";
          const w = stage!.clientWidth;
          const h = stage!.clientHeight;
          if (m >= 0.999) {
            reveal.style.clipPath = "none";
          } else {
            const e = Math.pow(m, 1.7);
            const r = 8 + e * Math.hypot(w, h) * 1.05;
            reveal.style.clipPath = starPolygon(w, h, r, r * (0.13 + 0.6 * m * m));
          }
          if (revealImg) revealImg.style.transform = `scale(${(1.28 - 0.28 * easeInOutCubic(m)).toFixed(4)})`;
          if (captionRef.current) captionRef.current.style.opacity = clamp01((m - 0.7) / 0.3).toFixed(3);
        }
        const f = p > 0.45 && p < 0.7 ? Math.max(0, 1 - Math.abs(m - 0.03) / 0.09) * 0.85 : 0;
        if (flareRef.current) flareRef.current.style.opacity = f.toFixed(3);
      }

      if (mode !== "gl") {
        // Fallback sem WebGL: "dolly" por escala do desenho.
        const fb = fallbackRef.current;
        const d = easeInOutCubic(clamp01(p / 0.58));
        if (fb) {
          fb.style.transform = `scale(${(1 + d * 2.6).toFixed(3)})`;
          fb.style.opacity = (1 - clamp01((p - 0.35) / 0.25)).toFixed(3);
        }
        positionLabels();
      }
    }

    /* ---------------- loop ---------------- */
    function tick(t: number) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (last && t - last < FRAME_MS) return;
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      step(t, dt);
    }

    function step(t: number, dt: number) {
      if (!scene) return;
      smooth += (progress - smooth) * (reduced ? 1 : 0.1);
      S.dolly = easeInOutCubic(clamp01(smooth / 0.58));
      S.ptrX += (ptr.x - S.ptrX) * 0.04;
      S.ptrY += (ptr.y - S.ptrY) * 0.04;
      scene.render(t / 1000, dt, S);
      positionLabels();
    }

    function renderOnce() {
      step(performance.now(), 16);
    }

    function sync() {
      const want = mode === "gl" && !reduced && visible && !document.hidden;
      if (want && !running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      } else if (!want && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }

    /* ---------------- init ---------------- */
    measure();
    applyScroll();

    const goNoGl = () => {
      mode = "nogl";
      setGlMode("nogl");
      measure();
      applyScroll();
    };

    if (!hasWebGL()) {
      goNoGl();
    } else {
      import("./constellationScene")
        .then(({ createConstellationScene }) => {
          if (disposed) return;
          scene = createConstellationScene(canvas, { small });
          mode = "gl";
          setGlMode("gl");
          measure();
          if (reduced) renderOnce();
          sync();
        })
        .catch(goNoGl);
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(track);
    const onVis = () => sync();
    document.addEventListener("visibilitychange", onVis);

    const onPointer = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!reduced && finePointer) stage.addEventListener("pointermove", onPointer, { passive: true });

    let rz = 0;
    let refreshST: (() => void) | null = null;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(rz);
      rz = window.setTimeout(() => {
        measure();
        applyScroll();
        if (reduced || !running) renderOnce();
        refreshST?.();
      }, 120);
    });
    ro.observe(stage);

    // Decodifica a arte revelada antes de precisar dela (evita flash).
    revealImg?.decode?.().catch(() => undefined);

    /* ---------------- GSAP ---------------- */
    let revertGsap: (() => void) | undefined;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (disposed) return;
      const ctx = gsap.context(() => {
        const words = copy.querySelectorAll<HTMLElement>("[data-word]");
        const fades = copy.querySelectorAll<HTMLElement>("[data-fade]");
        if (reduced) {
          gsap.set(words, { y: 0, yPercent: 0 });
          gsap.set(fades, { opacity: 1, y: 0 });
          setIntroDone(true);
          return;
        }
        // y: 0 zera a translação herdada do CSS de estado inicial (senão o GSAP a soma ao yPercent).
        gsap.set(words, { y: 0, yPercent: 110 });
        gsap.set(fades, { opacity: 0, y: 18 });
        setIntroDone(true);
        const tl = gsap.timeline({ delay: 0.15 });
        tl.to(S, { reveal: 1, duration: 2.4, ease: "power2.out" }, 0)
          .to(S, { draw: 1, duration: 1.3, ease: "power2.inOut" }, 0.9)
          .to(S, { flare: 1, duration: 0.45, ease: "power3.out" }, 2.0)
          .to(S, { flare: 0.38, duration: 1.4, ease: "power2.inOut" }, 2.45)
          .to(words, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.06 }, 1.9)
          .to(fades, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 2.3);
        if (mode !== "gl") tl.eventCallback("onUpdate", positionLabels);

        const st = ScrollTrigger.create({
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            progress = self.progress;
            applyScroll();
          }
        });
        refreshST = () => st.refresh();
      }, stage);
      revertGsap = () => ctx.revert();
    });

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(rz);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointermove", onPointer);
      revertGsap?.();
      scene?.dispose();
      scene = null;
    };
  }, []);

  return (
    <section ref={trackRef} className={styles.track} aria-labelledby="hero-title">
      <div
        ref={stageRef}
        className={cn(styles.stage, !introDone && styles.introPending)}
        data-gl={glMode}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        {/* Fallback sem WebGL: céu em CSS + constelação em SVG */}
        <div className={styles.cssSky} aria-hidden="true" />
        <div ref={fallbackRef} className={styles.fallback} aria-hidden="true">
          <svg ref={fbLinesRef} className={styles.fbLines}>
            <line pathLength={1} className={styles.fbTri} />
            <line pathLength={1} className={styles.fbTri} />
            <line pathLength={1} className={styles.fbTri} />
            <line pathLength={1} className={styles.fbSpoke} />
            <line pathLength={1} className={styles.fbSpoke} />
            <line pathLength={1} className={styles.fbSpoke} />
          </svg>
          {team.map((m) => (
            <span key={m.id} data-fb-star className={styles.fbStar} data-color={m.color} />
          ))}
          <span data-fb-star className={styles.fbCenter} />
        </div>

        {/* Rótulos dos criadores (posicionados por projeção 3D ou pelo layout) */}
        <ul className={styles.labels} aria-label="Os criadores">
          {team.map((m, i) => (
            <li key={m.id} className={styles.labelItem}>
              <span
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className={styles.label}
                data-color={m.color}
              >
                <b>{m.shortName}</b>
                <span>{m.focus}</span>
              </span>
            </li>
          ))}
        </ul>

        <div ref={flareRef} className={styles.flare} aria-hidden="true" />

        <div ref={revealRef} className={styles.reveal} aria-hidden="true">
          <Image
            src={confronto}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            loading="eager"
            className={styles.revealImg}
          />
          <div ref={captionRef} className={styles.caption}>
            <div className="wrap">
              <span className="label" style={{ color: "#fde68a" }}>
                Projeto principal
              </span>
              <p className={styles.captionTitle}>MUFF Origem</p>
            </div>
          </div>
        </div>

        <div ref={copyRef} className={styles.copy}>
          <span className={cn("label", styles.kicker)} data-fade>
            Estúdio independente brasileiro
          </span>
          <h1 id="hero-title" className={cn("t-hero", styles.title)}>
            {HEADLINE.map((w, i) => (
              <Fragment key={i}>
                <span className={styles.wm}>
                  <span data-word className={cn(styles.w, w.accent && "accent-gold")}>
                    {w.text}
                  </span>
                </span>
                {i < HEADLINE.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <p className={styles.sub} data-fade>
            Somos a C-STAR Studios, o estúdio por trás de MUFF Origem, um RPG social no navegador.
          </p>
          <div className={cn("btn-row", styles.ctas)} data-fade>
            <a className="btn btn-gold" href="#muff">
              Conhecer o MUFF <span aria-hidden>↓</span>
            </a>
            <Link className="btn btn-ghost" href="/contato">
              Falar conosco
            </Link>
          </div>
        </div>

        <div ref={cueRef} className={styles.cue} aria-hidden="true">
          <span className="label">role</span>
          <i />
        </div>
      </div>
    </section>
  );
}
