import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlowCard } from "@/components/ui/GlowCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { siteLinks, universeContent } from "@/lib/siteContent";

export function UniverseSection() {
  return (
    <Section id="universo" className="pt-10">
      <ScrollReveal>
        <GlowCard className="universe-showcase overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative z-10 p-7 sm:p-10 lg:p-12">
              <SectionHeading
                eyebrow={universeContent.eyebrow}
                title={universeContent.title}
                description={universeContent.description}
              />
              <p className="mt-5 text-base leading-8 text-slate-400">
                {universeContent.complement}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {universeContent.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                    <span className="flex size-6 items-center justify-center rounded-sm border border-sky-300/30 bg-sky-300/10 text-sky-200">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <Button href={siteLinks.muff} className="mt-9" icon="arrow">
                {universeContent.cta}
                <ExternalLink className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="muff-split-scene min-h-[460px]" aria-hidden>
              <div className="muff-side muff-side--home">
                <div className="muff-house" />
                <div className="muff-garden" />
                <span className="muff-pet" />
                <span className="muff-player muff-player--home" />
              </div>
              <div className="muff-side muff-side--dungeon">
                <div className="muff-dungeon" />
                <span className="muff-monster" />
                <span className="muff-player muff-player--dungeon" />
                <span className="muff-spell" />
              </div>
              <div className="muff-center-portal">
                <span />
              </div>
            </div>
          </div>
        </GlowCard>
      </ScrollReveal>
    </Section>
  );
}
