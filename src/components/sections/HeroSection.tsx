"use client";

import { useEffect, useRef } from "react";
import { CosmicWorldScene } from "@/components/effects/CosmicWorldScene";
import { Button } from "@/components/ui/Button";
import { heroContent } from "@/lib/siteContent";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function animateHero() {
      if (!heroRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const gsapModule = await import("gsap");
      const { gsap } = gsapModule;

      if (cancelled || !heroRef.current) {
        return;
      }

      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".hero-reveal",
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            delay: 0.16
          }
        );
      }, heroRef);

      cleanup = () => ctx.revert();
    }

    animateHero();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative mx-auto grid min-h-[calc(100svh-1px)] w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-28 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pt-24"
    >
      <div className="relative z-10 max-w-2xl">
        <p className="hero-reveal eyebrow">{heroContent.eyebrow}</p>
        <h1 className="hero-reveal mt-6 text-5xl font-black leading-[0.92] tracking-[0.04em] text-slate-50 text-glow sm:text-6xl lg:text-7xl">
          {heroContent.title}
        </h1>
        <p className="hero-reveal mt-6 max-w-xl text-3xl font-black uppercase leading-tight tracking-[0.08em] text-slate-50 sm:text-4xl">
          {heroContent.headline}
        </p>
        <p className="hero-reveal mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
          {heroContent.description}
        </p>
        <div className="hero-reveal mt-9 flex flex-col gap-4 sm:flex-row">
          <Button href="#universo">{heroContent.primaryCta}</Button>
          <Button href="#contato" variant="secondary" icon="arrow">
            {heroContent.secondaryCta}
          </Button>
        </div>
      </div>

      <div className="hero-reveal relative z-10">
        <CosmicWorldScene />
      </div>
    </section>
  );
}
