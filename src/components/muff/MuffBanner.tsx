import Image from "next/image";
import Link from "next/link";
import confronto from "@/assets/muff/login-confronto.webp";
import { siteLinks } from "@/lib/siteContent";
import styles from "./MuffBanner.module.css";

/** Abertura da página do projeto MUFF (arte promocional em tela cheia). */
export function MuffBanner() {
  return (
    <header className={styles.banner}>
      <Image
        src={confronto}
        alt="Arte promocional de MUFF: Tyrone, Umay, Arzagaia e Don Hector de costas, diante do Rei Esqueleto gigante numa praia"
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className={styles.img}
      />
      <div className={styles.shade} aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <nav aria-label="Trilha">
          <ol className={styles.crumbs}>
            <li>
              <Link href="/projetos">Projetos</Link>
            </li>
            <li aria-current="page">MUFF Origem</li>
          </ol>
        </nav>
        <h1 className="t-hero">MUFF Origem</h1>
        <p className="lead">
          Um RPG social que vive no navegador: a sua Casa, um mundo compartilhado, campeões com história e aventuras em
          grupo. Criado pela C-STAR Studios.
        </p>
        <div className="btn-row">
          <a className="btn btn-gold" href={siteLinks.muff} target="_blank" rel="noopener noreferrer">
            Site oficial do MUFF <span aria-hidden>↗</span>
            <span className="sr-only">(abre em nova aba)</span>
          </a>
          <a className="btn btn-ghost" href={siteLinks.play} target="_blank" rel="noopener noreferrer">
            Jogar a versão de desenvolvimento <span aria-hidden>↗</span>
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </div>
      </div>
    </header>
  );
}
