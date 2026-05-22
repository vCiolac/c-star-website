import { Orbit, Star, Users } from "lucide-react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { DividerStar } from "@/components/ui/DividerStar";
import { PixelCard } from "@/components/ui/PixelCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pillars } from "@/lib/siteContent";

const iconMap = {
  orbit: Orbit,
  users: Users,
  star: Star
};

export function PillarsSection() {
  return (
    <Section id="pilares" className="pt-6">
      <DividerStar />
      <ScrollReveal>
        <SectionHeading eyebrow="PILARES" title="O que guia a C-STAR" align="center" />
      </ScrollReveal>
      <ScrollReveal itemSelector=".pillar-card" className="mt-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = iconMap[pillar.icon as keyof typeof iconMap];
            return (
              <PixelCard key={pillar.title} className="pillar-card p-7">
                <div className="icon-tile icon-tile--gold">
                  <Icon className="size-7" aria-hidden />
                </div>
                <h3 className="mt-7 text-xl font-black uppercase tracking-[0.08em] text-slate-50">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{pillar.text}</p>
              </PixelCard>
            );
          })}
        </div>
      </ScrollReveal>
    </Section>
  );
}
