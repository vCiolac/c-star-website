import type { StaticImageData } from "next/image";
import buildMode from "@/assets/muff/build_mode.png";
import casa from "@/assets/muff/casa.jpg";
import arzagaia from "@/assets/muff/champ/arzagaia-full.webp";
import donHector from "@/assets/muff/champ/don_hector-full.webp";
import tyrone from "@/assets/muff/champ/tyrone-full.webp";
import umay from "@/assets/muff/champ/umay-full.webp";
import flowerGuardian from "@/assets/muff/flower-guardian.webp";
import greenhouse from "@/assets/muff/greenhouse.webp";
import grove from "@/assets/muff/grove.webp";
import monu from "@/assets/muff/monu.webp";
import nergia from "@/assets/muff/nergia.webp";
import ocdc from "@/assets/muff/ocdc.webp";
import stuway from "@/assets/muff/stuway-iii.webp";
import visitors from "@/assets/muff/visitors.webp";

export type Art = { image: StaticImageData; alt: string };

/* ------------------------------------------------------------------ */
/* Home: sequência cinematográfica em capítulos (arte + texto juntos)  */
/* ------------------------------------------------------------------ */

export type Chapter = {
  id: string;
  index: string;
  title: string;
  line: string;
  body: string;
  background: Art;
  /** Personagens recortados sobre o fundo (opcional). */
  cast?: Art[];
};

export const champions: Art[] = [
  { image: tyrone, alt: "Tyrone, campeão ruivo empunhando uma foice" },
  { image: umay, alt: "Umay, arqueira guardiã" },
  { image: arzagaia, alt: "Arzagaia, destruidora" },
  { image: donHector, alt: "Don Hector, bruxo" }
];

export const chapters: Chapter[] = [
  {
    id: "casa",
    index: "01",
    title: "A Casa",
    line: "Todo jogador começa em um lugar que é seu.",
    body: "Decorar, plantar, cuidar e receber visitas. A Casa é o ponto de partida e o lugar para onde sempre se volta depois da aventura.",
    background: {
      image: casa,
      alt: "Interior aconchegante de uma casa de madeira com lareira, piano e um computador antigo"
    }
  },
  {
    id: "mundo",
    index: "02",
    title: "O Mundo",
    line: "Uma fantasia compartilhada, construída aos poucos.",
    body: "Cidades, florestas e ruínas onde os jogadores se encontram, conversam, trocam e descobrem as histórias de um universo que continua crescendo.",
    background: {
      image: nergia,
      alt: "Nergia ao entardecer: mercado iluminado por lanternas entre torres em ruínas"
    }
  },
  {
    id: "campeoes",
    index: "03",
    title: "Os Campeões",
    line: "Heróis com história, voz e estilo próprios.",
    body: "Cada campeão nasce de uma ideia, ganha um conjunto de habilidades e entra em grupo nas caçadas, onde formação e estratégia fazem a diferença.",
    background: {
      image: grove,
      alt: "Floresta bioluminescente com um rio entre raízes gigantes"
    },
    cast: champions
  }
];

/* ------------------------------------------------------------------ */
/* /projetos/muff: galeria de arte e cenas                              */
/* ------------------------------------------------------------------ */

export type GalleryItem = Art & {
  title: string;
  caption: string;
  /** "scene" ocupa célula larga; "cutout" tem fundo transparente. */
  kind: "scene" | "cutout";
};

export const gallery: GalleryItem[] = [
  {
    image: nergia,
    alt: "Nergia ao entardecer: mercado iluminado entre torres em ruínas",
    title: "Nergia",
    caption: "A cidade onde os jogadores se encontram.",
    kind: "scene"
  },
  {
    image: grove,
    alt: "Floresta bioluminescente com um rio entre raízes gigantes",
    title: "O bosque",
    caption: "Natureza que brilha no escuro.",
    kind: "scene"
  },
  {
    image: monu,
    alt: "Planeta de MUFF com oceanos turquesa e continentes violeta",
    title: "O planeta",
    caption: "O mundo visto de longe.",
    kind: "cutout"
  },
  {
    image: greenhouse,
    alt: "Inventor trabalhando à noite em uma estufa cheia de máquinas e plantas",
    title: "A estufa",
    caption: "Ciência, sucata e plantas.",
    kind: "scene"
  },
  {
    image: flowerGuardian,
    alt: "Besouro mecânico diante de uma flor de cristal luminosa",
    title: "Guardião da flor",
    caption: "Criaturas entre o orgânico e o mecânico.",
    kind: "cutout"
  },
  {
    image: ocdc,
    alt: "Salão em ruínas com pessoas trabalhando diante de monitores com mapas",
    title: "A central",
    caption: "Onde o mundo é mapeado.",
    kind: "scene"
  },
  {
    image: visitors,
    alt: "Dois viajantes de casaco longo caminhando lado a lado",
    title: "Os visitantes",
    caption: "Quem chega de fora.",
    kind: "cutout"
  },
  {
    image: stuway,
    alt: "Nave colossal com propulsores azuis",
    title: "Stuway III",
    caption: "O que existe além do céu.",
    kind: "cutout"
  }
];

/* ------------------------------------------------------------------ */
/* /projetos/muff: evolução tecnológica (Godot → navegador)             */
/* ------------------------------------------------------------------ */

export type TechStep = {
  id: string;
  index: string;
  tag: string;
  title: string;
  text: string;
  visual: "legacy" | "stack" | "server" | "sprites" | "today";
  image?: Art;
};

export const techSteps: TechStep[] = [
  {
    id: "legado",
    index: "01",
    tag: "Legado",
    title: "Um jogo para desktop",
    text: "O MUFF começou como jogo para PC: cliente em Godot e servidor em .NET com MySQL. O cliente legado já tinha um modo de construção de interiores.",
    visual: "legacy",
    image: {
      image: buildMode,
      alt: "Captura do cliente Godot antigo: interior de casa em pixel art no modo de construção"
    }
  },
  {
    id: "decisao",
    index: "02",
    tag: "Decisão",
    title: "Reconstruir para a Web",
    text: "Decidimos refazer o jogo para rodar no navegador, sem instalar nada, mantendo o universo, os personagens e a pixel art.",
    visual: "stack"
  },
  {
    id: "servidor",
    index: "03",
    tag: "Arquitetura",
    title: "O servidor decide",
    text: "Um servidor Node autoritativo decide movimento, combate e economia, e o PostgreSQL guarda o estado. O navegador apresenta o resultado.",
    visual: "server"
  },
  {
    id: "phaser",
    index: "04",
    tag: "Apresentação",
    title: "Pixel art em tempo real",
    text: "Sprites desenhados quadro a quadro ganham vida no navegador com Phaser: campeões caminham, lutam e se reagrupam.",
    visual: "sprites"
  },
  {
    id: "hoje",
    index: "05",
    tag: "Versão de desenvolvimento",
    title: "Casa, Cidade e Caçadas",
    text: "A versão de desenvolvimento já reúne a Casa e o Quintal, a cidade de Nergia e caçadas em grupo com campeões.",
    visual: "today",
    image: { image: nergia, alt: "Nergia, a cidade compartilhada de MUFF" }
  }
];

/* ------------------------------------------------------------------ */
/* /projetos/muff: estudo de caso do pipeline de um campeão             */
/* ------------------------------------------------------------------ */

export type PipelineStep = {
  member: "juan" | "victor" | "rodrigo";
  label: string;
  title: string;
  text: string;
};

export const championPipeline: PipelineStep[] = [
  {
    member: "juan",
    label: "Ideia",
    title: "O campeão é imaginado",
    text: "Personalidade, história, papel no grupo e animações: tudo começa no design do universo."
  },
  {
    member: "victor",
    label: "Kit e IA",
    title: "O kit vira sistema",
    text: "Habilidades, inteligência artificial de combate e regras que o servidor aplica com justiça para todos."
  },
  {
    member: "rodrigo",
    label: "Voz, som e mundo",
    title: "Ganha som e lugar",
    text: "Música, efeitos sonoros e os mapas, missões e NPCs onde o campeão vai viver."
  }
];

/** Fatos honestos e datados da versão de desenvolvimento (página do projeto). */
export const devSnapshot = {
  asOf: "outubro de 2026",
  items: [
    "Casa e Quintal: decorar, plantar, cuidar de pets e receber visitas",
    "Cidade de Nergia compartilhada: coleta, pesca, chat e amigos",
    "12 campeões jogáveis em 6 classes",
    "Caçadas com grupo de até 4 campeões, com formação e estratégia",
    "Mundo Aberto com controle manual: em desenvolvimento"
  ]
};
