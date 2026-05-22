import { Badge, Heart, Home, Server, Swords, Users } from "lucide-react";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { features } from "@/lib/siteContent";

const iconMap = {
  home: Home,
  users: Users,
  swords: Swords,
  badge: Badge,
  server: Server,
  heart: Heart
};

export function FeatureStrip() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 sm:px-8" aria-label="Destaques da C-STAR">
      <ScrollReveal itemSelector=".feature-card">
        <div className="feature-strip grid gap-px overflow-hidden rounded-sm border border-violet-300/18 bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-6">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];

            return (
              <article key={feature.title} className="feature-card group p-6 text-center">
                <Icon className="mx-auto size-8 text-sky-300 transition duration-300 group-hover:scale-110 group-hover:text-amber-300" aria-hidden />
                <h3 className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-3 text-xs uppercase leading-6 tracking-[0.08em] text-slate-400">
                  {feature.text}
                </p>
              </article>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
