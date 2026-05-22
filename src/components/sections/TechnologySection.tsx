import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { GlowCard } from "@/components/ui/GlowCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { technologyContent } from "@/lib/siteContent";

export function TechnologySection() {
  return (
    <Section id="tecnologia">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <ScrollReveal>
          <SectionHeading
            eyebrow={technologyContent.eyebrow}
            title={technologyContent.title}
            description={technologyContent.description}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {technologyContent.tags.map((tag) => (
              <span key={tag} className="tech-tag">
                {tag}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal itemSelector=".process-card">
          <GlowCard className="p-7">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Da ideia ao mundo
            </p>
            <div className="process-grid mt-7">
              {technologyContent.process.map((step, index) => (
                <article key={step.title} className="process-card">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </GlowCard>
        </ScrollReveal>
      </div>
    </Section>
  );
}
