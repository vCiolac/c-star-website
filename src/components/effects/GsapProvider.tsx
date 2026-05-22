"use client";

import { useEffect } from "react";

type GsapProviderProps = {
  children: React.ReactNode;
};

export function GsapProvider({ children }: GsapProviderProps) {
  useEffect(() => {
    let mounted = true;

    async function registerGsap() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      if (!mounted) {
        return;
      }

      gsapModule.gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);
    }

    registerGsap();

    return () => {
      mounted = false;
    };
  }, []);

  return <>{children}</>;
}
