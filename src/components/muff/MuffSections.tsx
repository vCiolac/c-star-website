import Image from "next/image";
import flowerGuardian from "@/assets/muff/flower-guardian.webp";
import logo from "@/assets/muff/muff-logo.png";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { chapters, devSnapshot } from "@/content/muff";
import { siteLinks } from "@/lib/siteContent";
import styles from "./MuffSections.module.css";

/** Apresentação do projeto: o que é o MUFF, em termos conceituais. */
export function MuffOverview() {
  return (
    <section id="apresentacao" className="section" aria-labelledby="apresentacao-title">
      <div className={`wrap ${styles.split}`}>
        <div className="section-head">
          <span className="label">Apresentação</span>
          <h2 id="apresentacao-title" className="t-1">
            Um lugar para viver, não só para jogar.
          </h2>
          <p className="lead">
            MUFF Origem é o primeiro grande mundo da C-STAR Studios. É um RPG social que roda direto no navegador, sem
            instalação: você abre o link e entra num universo de fantasia com outras pessoas.
          </p>
          <p className="prose-muted">
            O jogo gira em torno de três ideias: ter um lugar seu, dividir um mundo com outros jogadores e viver
            aventuras em grupo ao lado de campeões com personalidade, voz e estilo próprios.
          </p>
        </div>
        <ScrollReveal className={styles.pillars} itemSelector="[data-p]">
          {chapters.map((c) => (
            <article key={c.id} data-p className={styles.pillar}>
              <div className={styles.pillarImg}>
                <Image src={c.background.image} alt="" fill sizes="(min-width: 900px) 200px, 40vw" placeholder="blur" />
              </div>
              <div>
                <h3 className="t-3">{c.title}</h3>
                <p>{c.line}</p>
              </div>
            </article>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

const history = [
  {
    title: "Uma ideia que virou universo",
    text: "O universo MUFF foi idealizado por Juan César. Em torno dele, a C-STAR reúne três criadores com papéis complementares: criação e narrativa, tecnologia, mundo e som."
  },
  {
    title: "O primeiro jogo, no desktop",
    text: "A primeira versão foi um jogo para PC, com cliente em Godot e servidor em .NET com banco MySQL. O cliente legado já tinha um modo de construção de interiores em pixel art."
  },
  {
    title: "A virada para o navegador",
    text: "O jogo foi reconstruído para a Web: um servidor Node autoritativo com PostgreSQL e a apresentação em pixel art rodando no navegador com Phaser."
  },
  {
    title: "Um mundo que continua crescendo",
    text: "Hoje o MUFF evolui em uma versão de desenvolvimento aberta, onde a Casa, a Cidade e as Caçadas já podem ser experimentadas."
  }
];

/** História do projeto (sem datas não confirmadas). */
export function MuffHistory() {
  return (
    <section id="historia" className="section" aria-labelledby="historia-title">
      <div className={`wrap ${styles.historyGrid}`}>
        <div className={styles.historyAside}>
          <div className="section-head">
            <span className="label">História do projeto</span>
            <h2 id="historia-title" className="t-1">
              De um rascunho a um mundo aberto a todos.
            </h2>
          </div>
          <div className={styles.historyArt} aria-hidden="true">
            <Image src={flowerGuardian} alt="" sizes="(min-width: 900px) 420px, 90vw" placeholder="blur" />
          </div>
        </div>
        <ScrollReveal as="div" className={styles.timeline} itemSelector="[data-h]">
          <ol>
            {history.map((h, i) => (
              <li key={h.title} data-h>
                <span className={styles.dot} aria-hidden="true" />
                <span className="label accent-gold">Capítulo {String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-3">{h.title}</h3>
                <p>{h.text}</p>
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </div>
    </section>
  );
}

/** Retrato honesto e datado da versão de desenvolvimento + CTAs finais. */
export function MuffDevSnapshot() {
  return (
    <section id="hoje" className={`section ${styles.snapshot}`} aria-labelledby="hoje-title">
      <div className={`wrap ${styles.snapGrid}`}>
        <div className={styles.snapLogo} aria-hidden="true">
          <Image src={logo} alt="" sizes="220px" placeholder="blur" />
        </div>
        <div className={styles.snapBody}>
          <span className="label">Na versão de desenvolvimento · {devSnapshot.asOf}</span>
          <h2 id="hoje-title" className="t-1">
            O que já dá para experimentar.
          </h2>
          <ul className={styles.facts}>
            {devSnapshot.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className={styles.disclaimer}>
            A versão de desenvolvimento muda com frequência. Conteúdos e números podem mudar até o lançamento.
          </p>
          <div className="btn-row">
            <a className="btn btn-gold" href={siteLinks.play} target="_blank" rel="noopener noreferrer">
              Jogar a versão de desenvolvimento <span aria-hidden>↗</span>
              <span className="sr-only">(abre em nova aba)</span>
            </a>
            <a className="btn btn-ghost" href={siteLinks.muff} target="_blank" rel="noopener noreferrer">
              Site oficial do MUFF <span aria-hidden>↗</span>
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
