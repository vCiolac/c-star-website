"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { StarMark } from "@/components/ui/StarMark";
import { navItems, siteLinks } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import styles from "./Header.module.css";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // "/projetos" não deve ficar ativo dentro de "/projetos/muff" (tem item próprio)
  if (href === "/projetos") return pathname === "/projetos";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu ao trocar de rota.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Animação do painel (GSAP sob demanda) + foco no primeiro link.
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    panel.querySelector<HTMLAnchorElement>("a")?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      const tween = gsap.fromTo(
        panel,
        { autoAlpha: 0, y: -12, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: "power2.out" }
      );
      cleanup = () => {
        tween.kill();
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isOpen]);

  // Bloqueio de scroll + Escape para fechar.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <header className={cn(styles.header, (isScrolled || isOpen) && styles.solid)}>
      <div className={cn("wrap", styles.bar)}>
        <Link href="/" className={styles.brand} aria-label="C-STAR Studios, página inicial">
          <StarMark className={styles.star} />
          <span className={styles.word}>C-STAR</span>
          <span className={styles.studios}>Studios</span>
        </Link>

        <nav className={styles.nav} aria-label="Menu principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.link}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          className={cn("btn btn-ghost btn-sm", styles.cta)}
          href={siteLinks.play}
          target="_blank"
          rel="noopener noreferrer"
        >
          Jogar MUFF <span aria-hidden>↗</span>
          <span className="sr-only">(versão de desenvolvimento, abre em nova aba)</span>
        </a>

        <button
          ref={buttonRef}
          type="button"
          className={styles.menuButton}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className={cn(styles.burger, isOpen && styles.burgerOpen)} aria-hidden />
        </button>
      </div>

      {isOpen ? (
        <div id="mobile-menu" ref={panelRef} className={styles.panel}>
          <nav aria-label="Menu mobile">
            <ul className={styles.panelList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.panelLink}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    onClick={() => close()}
                  >
                    {item.label}
                    <StarMark className={styles.panelStar} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a
            className="btn btn-gold"
            style={{ width: "100%", marginTop: 16 }}
            href={siteLinks.play}
            target="_blank"
            rel="noopener noreferrer"
          >
            Jogar a versão de desenvolvimento <span aria-hidden>↗</span>
          </a>
        </div>
      ) : null}
    </header>
  );
}
