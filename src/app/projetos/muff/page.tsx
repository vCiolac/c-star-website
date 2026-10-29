import type { Metadata } from "next";
import { CreatorsConstellation } from "@/components/home/CreatorsConstellation";
import { ChampionPipeline } from "@/components/muff/ChampionPipeline";
import { MuffBanner } from "@/components/muff/MuffBanner";
import { MuffGallery } from "@/components/muff/MuffGallery";
import { MuffDevSnapshot, MuffHistory, MuffOverview } from "@/components/muff/MuffSections";
import { TechTimeline } from "@/components/muff/TechTimeline";
import { SITE_URL } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "MUFF Origem",
  description:
    "MUFF Origem, o RPG social no navegador criado pela C-STAR Studios: arte, história do projeto, a migração do Godot para a Web e o processo criativo dos três criadores.",
  alternates: { canonical: "/projetos/muff" },
  openGraph: { title: "MUFF Origem · C-STAR Studios", url: "/projetos/muff" }
};

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "MUFF Origem",
  url: `${SITE_URL}/projetos/muff`,
  sameAs: ["https://www.muffoficial.com.br/"],
  genre: ["RPG", "Social"],
  gamePlatform: "Navegador web",
  inLanguage: "pt-BR",
  author: { "@type": "Organization", name: "C-STAR Studios", url: SITE_URL }
};

export default function MuffPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd).replace(/</g, "\\u003c") }} />
      <MuffBanner />
      <MuffOverview />
      <MuffGallery />
      <MuffHistory />
      <TechTimeline />
      <ChampionPipeline />
      <CreatorsConstellation
        id="equipe"
        title="Os três criadores do MUFF."
        intro="O MUFF é feito por três pessoas, cada uma responsável por uma parte do mundo. Juntas, elas formam a constelação da C-STAR."
      />
      <MuffDevSnapshot />
    </main>
  );
}
