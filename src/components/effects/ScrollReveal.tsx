"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  y?: number;
  delay?: number;
};

export function ScrollReveal({
  children,
  className,
  itemSelector,
  y = 28,
  delay = 0
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function animate() {
      if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;

      if (cancelled || !ref.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const targets = itemSelector
          ? gsap.utils.toArray<HTMLElement>(itemSelector)
          : [ref.current as HTMLDivElement];

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            delay,
            duration: 0.8,
            ease: "power3.out",
            stagger: itemSelector ? 0.1 : 0,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 82%",
              once: true
            }
          }
        );
      }, ref);

      cleanup = () => ctx.revert();
    }

    animate();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [delay, itemSelector, y]);

  return (
    <div ref={ref} className={cn("scroll-reveal", className)}>
      {children}
    </div>
  );
}
