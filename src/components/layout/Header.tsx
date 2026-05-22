"use client";

import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { navItems, siteLinks } from "@/lib/siteContent";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function animatePanel() {
      if (!panelRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const gsapModule = await import("gsap");
      const { gsap } = gsapModule;

      if (cancelled || !panelRef.current) {
        return;
      }

      if (isOpen) {
        gsap.fromTo(
          panelRef.current,
          { autoAlpha: 0, y: -12, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: "power2.out" }
        );
      }

      cleanup = () => gsap.killTweensOf(panelRef.current);
    }

    animatePanel();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition duration-300",
        isScrolled || isOpen
          ? "border-b border-white/10 bg-[#050816]/82 shadow-[0_12px_44px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="#top"
          className="group flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          aria-label="C-STAR Studios, voltar ao início"
        >
          <span className="logo-mark">
            C-ST<span aria-hidden>★</span>R
          </span>
          <span className="hidden text-[0.62rem] font-black uppercase tracking-[0.65em] text-amber-300 sm:block">
            Studios
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Menu principal">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href={siteLinks.muff} className="min-h-11 px-4 py-2 text-xs">
            Conheça MUFF
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-sm border border-white/12 bg-white/[0.04] text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 lg:hidden"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {isOpen ? (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="mx-5 mb-5 rounded-sm border border-sky-300/20 bg-[#050816]/96 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:mx-8 lg:hidden"
        >
          <nav className="grid gap-1" aria-label="Menu mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border-b border-white/[0.08] px-2 py-4 text-base font-bold uppercase tracking-[0.14em] text-slate-100"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
                <Sparkles className="size-4 text-amber-300" aria-hidden />
              </Link>
            ))}
          </nav>
          <Button href={siteLinks.muff} className="mt-4 w-full">
            Conheça MUFF
          </Button>
        </div>
      ) : null}
    </header>
  );
}
