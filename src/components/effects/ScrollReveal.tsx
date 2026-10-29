"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seletor dos itens internos animados em sequência (padrão: o próprio bloco). */
  itemSelector?: string;
  y?: number;
  as?: "div" | "section" | "article";
};

/** Revela conteúdo ao entrar na viewport. Conteúdo fica visível sem JS e com movimento reduzido. */
export function ScrollReveal({ children, className, itemSelector, y = 28, as: Tag = "div" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const targets = itemSelector ? gsap.utils.toArray<HTMLElement>(itemSelector) : [el];
        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration: 0.8,
          ease: "power3.out",
          stagger: itemSelector ? 0.1 : 0,
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        });
      }, el);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [itemSelector, y]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
