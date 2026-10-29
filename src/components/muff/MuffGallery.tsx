import Image from "next/image";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { gallery } from "@/content/muff";
import { cn } from "@/lib/utils";
import styles from "./MuffGallery.module.css";

/** Galeria de arte e cenas do MUFF (cenas largas + recortes sobre fundo estrelado). */
export function MuffGallery() {
  return (
    <section id="arte" className="section" aria-labelledby="arte-title">
      <div className="wrap">
        <div className="section-head">
          <span className="label">Arte e cenas</span>
          <h2 id="arte-title" className="t-1">
            Um mundo pintado cena a cena.
          </h2>
          <p className="lead">
            Cidades, florestas, máquinas e personagens: algumas das artes que dão forma ao universo de MUFF.
          </p>
        </div>
        <ScrollReveal as="div" className={styles.grid} itemSelector="[data-g]">
          {gallery.map((g) => (
            <figure key={g.title} data-g className={cn(styles.item, g.kind === "scene" ? styles.scene : styles.cutout)}>
              <div className={styles.frame}>
                <Image
                  src={g.image}
                  alt={g.alt}
                  fill
                  sizes={g.kind === "scene" ? "(min-width: 900px) 66vw, 100vw" : "(min-width: 900px) 33vw, 100vw"}
                  placeholder="blur"
                  className={styles.img}
                />
              </div>
              <figcaption className={styles.cap}>
                <b>{g.title}</b>
                <span>{g.caption}</span>
              </figcaption>
            </figure>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
