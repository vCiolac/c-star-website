import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { DividerStar } from "@/components/ui/DividerStar";
import { GlowCard } from "@/components/ui/GlowCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { aboutContent } from "@/lib/siteContent";

export function AboutSection() {
  return (
    <Section id="sobre">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <ScrollReveal>
          <SectionHeading
            eyebrow={aboutContent.eyebrow}
            title={aboutContent.title}
            description={aboutContent.description}
          />
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
            {aboutContent.secondParagraph}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {aboutContent.highlights.map((highlight) => (
              <div key={highlight} className="mini-highlight">
                {highlight}
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <GlowCard className="constellation-card min-h-[420px] p-7">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200">
              Constelação de ideias
            </p>
            <div className="constellation-field mt-8">
              <svg viewBox="0 0 520 320" aria-hidden>
                <path d="M62 198L142 96L244 166L334 74L456 128L388 248L244 166L132 264L62 198Z" />
                <path d="M142 96L334 74M244 166L456 128M132 264L388 248" />
              </svg>
              {aboutContent.constellationWords.map((word, index) => (
                <span key={word} className={`idea-node idea-node--${index + 1}`}>
                  {word}
                </span>
              ))}
            </div>
          </GlowCard>
        </ScrollReveal>
      </div>
      <DividerStar />
    </Section>
  );
}
