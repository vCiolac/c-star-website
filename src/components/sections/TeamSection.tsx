import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { PixelCard } from "@/components/ui/PixelCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { team, teamContent } from "@/lib/siteContent";

export function TeamSection() {
  return (
    <Section id="equipe" className="pt-8">
      <ScrollReveal>
        <SectionHeading
          eyebrow={teamContent.eyebrow}
          title={teamContent.title}
          description={teamContent.description}
          align="center"
        />
      </ScrollReveal>
      <ScrollReveal itemSelector=".team-card" className="mt-12">
        <div className="grid gap-6 md:grid-cols-3">
          {team.map((member) => (
            <PixelCard key={member.name} className="team-card p-6">
              <div className="avatar-frame" aria-hidden>
                <span>{member.initials}</span>
              </div>
              <h3 className="mt-6 text-lg font-black uppercase tracking-[0.1em] text-slate-50">
                {member.name}
              </h3>
              <p className="mt-4 text-sm uppercase leading-7 tracking-[0.08em] text-slate-400">
                {member.role}
              </p>
            </PixelCard>
          ))}
        </div>
      </ScrollReveal>
      <p className="mx-auto mt-10 max-w-3xl text-center text-base leading-8 text-slate-400">
        {teamContent.finalText}
      </p>
    </Section>
  );
}
