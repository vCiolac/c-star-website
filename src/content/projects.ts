import type { StaticImageData } from "next/image";
import monu from "@/assets/muff/monu.webp";
import nergia from "@/assets/muff/nergia.webp";
import { siteLinks } from "@/lib/siteContent";

/**
 * Catálogo de projetos do estúdio.
 *
 * Para adicionar um projeto novo (ex.: FutMuf) basta acrescentar um item
 * aqui e criar a página em `src/app/projetos/<slug>/page.tsx`. O índice
 * /projetos, o sitemap e o destaque da Home leem desta lista.
 */

export type ProjectStatus = "em-desenvolvimento" | "lancado" | "pausado";

export type ProjectLink = {
  label: string;
  href: string;
  /** Rótulo de apoio curto, ex.: "Versão de desenvolvimento". */
  note?: string;
};

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  status: ProjectStatus;
  /** Plataformas/gêneros curtos, sem números temporários. */
  tags: string[];
  cover: { image: StaticImageData; alt: string };
  /** Arte secundária (opcional) para composições em camadas. */
  accent?: { image: StaticImageData; alt: string };
  links: ProjectLink[];
  /** Destaca o projeto na Home. */
  featured?: boolean;
};

export const statusLabel: Record<ProjectStatus, string> = {
  "em-desenvolvimento": "Em desenvolvimento",
  lancado: "Lançado",
  pausado: "Pausado"
};

export const projects: Project[] = [
  {
    slug: "muff",
    title: "MUFF Origem",
    kicker: "Projeto principal",
    summary:
      "Um universo de fantasia que vive no navegador: um RPG social onde cada jogador tem a sua Casa, encontra outras pessoas no mundo e parte em aventuras com os seus campeões.",
    status: "em-desenvolvimento",
    tags: ["RPG social", "Navegador", "Pixel art", "Multiplayer"],
    cover: {
      image: nergia,
      alt: "Nergia ao entardecer: mercado iluminado por lanternas entre torres em ruínas"
    },
    accent: { image: monu, alt: "Planeta de MUFF com oceanos turquesa e continentes violeta" },
    links: [
      { label: "Site oficial do MUFF", href: siteLinks.muff },
      {
        label: "Jogar a versão de desenvolvimento",
        href: siteLinks.play,
        note: "Versão de desenvolvimento"
      }
    ],
    featured: true
  }
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function projectHref(project: Pick<Project, "slug">) {
  return `/projetos/${project.slug}`;
}
