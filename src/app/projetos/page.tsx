import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projetos",
  description: "Os mundos que a C-STAR Studios está construindo, começando por MUFF Origem.",
  alternates: { canonical: "/projetos" },
  openGraph: { title: "Projetos · C-STAR Studios", url: "/projetos" }
};

export default function ProjetosPage() {
  return (
    <main>
      <PageIntro
        kicker="Projetos"
        title="Os mundos que estamos construindo."
        lead="Cada projeto da C-STAR nasce da mesma constelação de criadores. Hoje, toda a nossa energia está em MUFF Origem."
      />
      <section className="wrap" aria-label="Lista de projetos" style={{ paddingBottom: "clamp(80px, 10vw, 160px)" }}>
        <ul style={{ display: "grid", gap: 32, margin: 0, padding: 0, listStyle: "none" }}>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} headingLevel="h2" priority={i === 0} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
