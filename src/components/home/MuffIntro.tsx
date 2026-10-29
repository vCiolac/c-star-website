import Image from "next/image";
import monu from "@/assets/muff/monu.webp";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { siteLinks } from "@/lib/siteContent";
import styles from "./MuffIntro.module.css";

const pillars = [
  { title: "Um universo próprio", text: "Reinos, eras e personagens com história, criados do zero pela equipe." },
  { title: "RPG social no navegador", text: "Sem instalar nada: abrir o link e entrar no mundo com outras pessoas." },
  { title: "Criação de mundo", text: "A Casa, a cidade e as aventuras formam um lugar que cresce junto com quem joga." }
];

/** Apresentação conceitual (atemporal) do MUFF na Home. Sem métricas temporárias. */
export function MuffIntro() {
  return (
    <section id="muff" className={`section ${styles.section}`} aria-labelledby="muff-title">
      <div className={`wrap ${styles.grid}`}>
        <ScrollReveal className={styles.copy} itemSelector="[data-r]">
          <span className="label accent-gold" data-r>
            Nosso projeto principal
          </span>
          <h2 id="muff-title" className="t-1" data-r>
            MUFF Origem
          </h2>
          <p className="lead" data-r>
            Um universo de fantasia que vive no navegador. Em MUFF, cada jogador tem a sua Casa, encontra outras pessoas
            no mundo e parte em aventuras ao lado de campeões com história, voz e estilo próprios.
          </p>
          <ul className={styles.pillars} data-r>
            {pillars.map((p) => (
              <li key={p.title}>
                <h3 className="t-3">{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
          <div className="btn-row" data-r>
            <Button href="/projetos/muff">Conhecer o projeto</Button>
            <Button href={siteLinks.muff} variant="ghost">
              Site oficial
            </Button>
          </div>
        </ScrollReveal>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.orbit} />
          <div className={styles.orbit2} />
          <div className={styles.planetWrap}>
            <Image src={monu} alt="" sizes="(min-width: 960px) 520px, 80vw" placeholder="blur" className={styles.planet} />
          </div>
        </div>
      </div>
    </section>
  );
}
