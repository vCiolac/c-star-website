/**
 * Carregamento sob demanda do GSAP + ScrollTrigger (fora do bundle inicial).
 * Padrão de uso nos componentes:
 *   const { gsap } = await loadGsap();
 *   const mm = gsap.matchMedia(scope);  // ou gsap.context(fn, scope)
 *   ...; return () => mm.revert();
 */
type GsapBundle = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let pending: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!pending) {
    pending = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
      g.gsap.registerPlugin(st.ScrollTrigger);
      return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
    });
  }
  return pending;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
