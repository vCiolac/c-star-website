import Image from "next/image";
import Link from "next/link";
import { projectHref, statusLabel, type Project } from "@/content/projects";
import { cn } from "@/lib/utils";
import styles from "./ProjectCard.module.css";

type Props = {
  project: Project;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
};

/** Cartão editorial de projeto (arte em camadas + texto). Lê tudo de projects.ts. */
export function ProjectCard({ project, headingLevel: H = "h3", priority = false }: Props) {
  const href = projectHref(project);
  return (
    <article className={styles.card} aria-labelledby={`p-${project.slug}`}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
        <Image
          src={project.cover.image}
          alt=""
          fill
          sizes="(min-width: 1100px) 640px, 100vw"
          placeholder="blur"
          priority={priority}
          className={styles.cover}
        />
        {project.accent ? (
          <span className={styles.accent}>
            <Image src={project.accent.image} alt="" sizes="220px" placeholder="blur" />
          </span>
        ) : null}
      </Link>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className="label accent-gold">{project.kicker}</span>
          <span className={cn("label", styles.status)}>{statusLabel[project.status]}</span>
        </div>
        <H id={`p-${project.slug}`} className="t-1">
          <Link href={href} className={styles.titleLink}>
            {project.title}
          </Link>
        </H>
        <p className={styles.summary}>{project.summary}</p>
        <ul className={styles.tags} aria-label="Características">
          {project.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="btn-row">
          <Link className="btn btn-gold" href={href}>
            Ver o projeto
          </Link>
          {project.links.slice(0, 1).map((l) => (
            <a key={l.href} className="btn btn-ghost" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label} <span aria-hidden>↗</span>
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
