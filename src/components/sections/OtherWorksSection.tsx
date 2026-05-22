import { Gamepad2, Music, Palette, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { GlowCard } from "@/components/ui/GlowCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { worksContent } from "@/lib/siteContent";

const iconMap = {
  sparkles: Sparkles,
  gamepad: Gamepad2,
  palette: Palette,
  music: Music
};

export function OtherWorksSection() {
  return (
    <Section id="trabalhos">
      <ScrollReveal>
        <SectionHeading
          eyebrow={worksContent.eyebrow}
          title={worksContent.title}
          description={worksContent.description}
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal itemSelector=".work-card" className="mt-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {worksContent.cards.map((card) => {
            const Icon = iconMap[card.icon as keyof typeof iconMap];

            return (
              <GlowCard key={card.title} as="article" className="work-card p-6">
                <div className="icon-tile">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mt-6 text-lg font-black uppercase tracking-[0.08em] text-slate-50">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{card.text}</p>
              </GlowCard>
            );
          })}
        </div>
      </ScrollReveal>
    </Section>
  );
}
