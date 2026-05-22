"use client";

import { useEffect, useRef } from "react";

export function CosmicWorldScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function animateScene() {
      if (!sceneRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;

      if (cancelled || !sceneRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".scene-layer",
          { autoAlpha: 0, y: 28, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.08
          }
        );

        gsap.to(".portal-core", {
          scale: 1.08,
          boxShadow:
            "0 0 28px rgba(56,189,248,0.85), 0 0 82px rgba(56,189,248,0.38)",
          repeat: -1,
          yoyo: true,
          duration: 1.8,
          ease: "sine.inOut"
        });

        gsap.to(".star-oracle", {
          rotate: 360,
          duration: 26,
          repeat: -1,
          ease: "none"
        });

        gsap.to(".floaty", {
          y: -10,
          repeat: -1,
          yoyo: true,
          duration: 2.7,
          ease: "sine.inOut",
          stagger: 0.25
        });

        gsap.to(".parallax-slow", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
          }
        });
      }, sceneRef);

      cleanup = () => ctx.revert();
    }

    animateScene();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={sceneRef} className="cosmic-world-scene" aria-label="Cena cósmica da C-STAR Studios">
      <div className="scene-layer scene-sky parallax-slow" aria-hidden>
        <svg className="constellation-map" viewBox="0 0 640 430" role="img" aria-label="Constelações douradas">
          <path d="M332 74L410 111L510 94L444 174L470 252L352 210L268 268L279 166L214 92L332 74Z" />
          <path d="M320 38V300M200 164H528M238 104C314 148 396 148 488 92M224 220C318 176 410 174 514 238" />
          <circle cx="332" cy="74" r="5" />
          <circle cx="410" cy="111" r="4" />
          <circle cx="510" cy="94" r="5" />
          <circle cx="444" cy="174" r="4" />
          <circle cx="470" cy="252" r="4" />
          <circle cx="352" cy="210" r="5" />
          <circle cx="268" cy="268" r="4" />
          <circle cx="279" cy="166" r="4" />
          <circle cx="214" cy="92" r="4" />
        </svg>
        <div className="star-oracle" />
      </div>

      <div className="scene-layer scene-ground" aria-hidden>
        <div className="moon-hills moon-hills--left" />
        <div className="moon-hills moon-hills--right" />
        <div className="pixel-path" />
      </div>

      <div className="scene-layer scene-home floaty" aria-hidden>
        <div className="pixel-house">
          <span className="roof" />
          <span className="body" />
          <span className="window window-a" />
          <span className="window window-b" />
          <span className="door" />
        </div>
        <div className="garden-grid" />
      </div>

      <div className="scene-layer scene-portal" aria-hidden>
        <div className="portal-stones" />
        <div className="portal-ring" />
        <div className="portal-core" />
        <div className="portal-runes" />
      </div>

      <div className="scene-layer scene-dungeon floaty" aria-hidden>
        <div className="castle-shadow">
          <span />
          <span />
          <span />
        </div>
        <div className="monster-shadow" />
      </div>

      <div className="scene-layer scene-party" aria-hidden>
        <span className="hero-silhouette hero-silhouette--mage" />
        <span className="hero-silhouette hero-silhouette--knight" />
        <span className="hero-silhouette hero-silhouette--ranger" />
        <span className="hero-silhouette hero-silhouette--bard" />
      </div>
    </div>
  );
}
