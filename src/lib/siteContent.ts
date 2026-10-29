/**
 * Conteúdo institucional compartilhado (C-STAR Studios).
 * URLs públicas são centralizadas aqui; as que dependem de ambiente leem
 * variáveis NEXT_PUBLIC_* (inlined no build) com defaults seguros.
 */

const DEFAULT_SITE_URL = "https://c-star.vercel.app";
const DEFAULT_PLAY_URL = "https://play-dev.muffoficial.com.br/";

function cleanUrl(value: string | undefined, fallback: string) {
  const v = value?.trim();
  if (!v) return fallback;
  try {
    return new URL(v).toString();
  } catch {
    return fallback;
  }
}

/** URL canônica do site (metadataBase, sitemap, JSON-LD). Sem barra final. */
export const SITE_URL = cleanUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL).replace(/\/$/, "");

export const siteLinks = {
  muff: "https://www.muffoficial.com.br/",
  /** Versão de desenvolvimento jogável do MUFF (abre em nova aba). */
  play: cleanUrl(process.env.NEXT_PUBLIC_PLAY_URL, DEFAULT_PLAY_URL),
  contactEmail: "mufforigem@gmail.com",
  contactMailto: "mailto:mufforigem@gmail.com"
} as const;

export const studio = {
  name: "C-STAR Studios",
  shortName: "C-STAR",
  tagline: "Estúdio independente brasileiro, criadores de MUFF Origem.",
  description:
    "C-STAR Studios é o estúdio independente brasileiro de Victor Ciolac, Juan César e Rodrigo Andrade, criadores de MUFF Origem, um RPG social que roda direto no navegador."
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Projetos", href: "/projetos" },
  { label: "MUFF Origem", href: "/projetos/muff" },
  { label: "Contato", href: "/contato" }
];

export type TeamMember = {
  id: "victor" | "juan" | "rodrigo";
  name: string;
  shortName: string;
  /** Rótulo curto usado na constelação do hero. */
  focus: string;
  role: string;
  text: string;
  /** Token de cor da estrela. */
  color: "portal" | "gold" | "rose";
};

/** Textos oficiais da equipe (não alterar sem aprovação). */
export const team: TeamMember[] = [
  {
    id: "victor",
    name: "Victor Ciolac",
    shortName: "Victor",
    focus: "código e sistemas",
    role: "Liderança Técnica e Desenvolvimento",
    text: "Arquitetura, programação, sistemas centrais, gameplay, inteligência artificial, caçadas e implementação das mecânicas.",
    color: "portal"
  },
  {
    id: "juan",
    name: "Juan César",
    shortName: "Juan",
    focus: "universo e design",
    role: "Criação, Game Design e Direção Narrativa",
    text: "Idealização do MUFF, concepção do jogo, história, mecânicas e animações.",
    color: "gold"
  },
  {
    id: "rodrigo",
    name: "Rodrigo Andrade",
    shortName: "Rodrigo",
    focus: "mundo e som",
    role: "Desenvolvimento de Mundo e Produção Audiovisual",
    text: "Programação, mapas, missões, NPCs, música e efeitos sonoros.",
    color: "rose"
  }
];

export const footerContent = {
  copyright: `© ${new Date().getFullYear()} C-STAR Studios. Todos os direitos reservados.`
};
