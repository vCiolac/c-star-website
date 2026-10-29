/** Assuntos aceitos pelo formulário (valores enviados à API). */
export const CONTACT_SUBJECTS = ["Parceria", "Imprensa", "Oportunidade", "Outro"] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export type ContactArea = {
  id: "parcerias" | "imprensa" | "oportunidades";
  subject: ContactSubject;
  kicker: string;
  title: string;
  text: string;
  points: string[];
  cta: string;
  /** Elemento visual da área. */
  visual: "orbit" | "signal" | "cluster";
  color: "gold" | "portal" | "rose";
};

export const contactAreas: ContactArea[] = [
  {
    id: "parcerias",
    subject: "Parceria",
    kicker: "Parcerias",
    title: "Construir junto",
    text: "Marcas, estúdios, criadores e plataformas que queiram colaborar com o universo de MUFF ou com a C-STAR em novos projetos.",
    points: ["Colaborações criativas e de conteúdo", "Publicação, distribuição e eventos", "Integrações e tecnologia"],
    cta: "Propor uma parceria",
    visual: "orbit",
    color: "gold"
  },
  {
    id: "imprensa",
    subject: "Imprensa",
    kicker: "Imprensa",
    title: "Contar a história",
    text: "Jornalistas, criadores de conteúdo e pesquisadores que queiram falar sobre o estúdio, o MUFF ou o desenvolvimento de jogos independentes no Brasil.",
    points: ["Entrevistas com a equipe", "Material visual do MUFF", "Informações sobre o projeto"],
    cta: "Falar com a imprensa",
    visual: "signal",
    color: "portal"
  },
  {
    id: "oportunidades",
    subject: "Oportunidade",
    kicker: "Oportunidades",
    title: "Entrar na constelação",
    text: "Artistas, músicos, dubladores, programadores e outros talentos que queiram mostrar seu trabalho. Conte o que você faz e envie seu portfólio.",
    points: ["Arte, animação e pixel art", "Voz, música e som", "Programação e design de jogos"],
    cta: "Apresentar meu trabalho",
    visual: "cluster",
    color: "rose"
  }
];
