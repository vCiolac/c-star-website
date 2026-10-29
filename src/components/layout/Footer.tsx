import Link from "next/link";
import { StarMark } from "@/components/ui/StarMark";
import { footerContent, navItems, siteLinks, studio } from "@/lib/siteContent";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.brandCol}>
          <p className={styles.brand}>
            <StarMark className={styles.star} />
            {studio.name}
          </p>
          <p className={styles.tagline}>{studio.tagline}</p>
        </div>

        <nav aria-label="Páginas">
          <p className="label">Páginas</p>
          <ul className={styles.list}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label">MUFF</p>
          <ul className={styles.list}>
            <li>
              <a href={siteLinks.muff} target="_blank" rel="noopener noreferrer">
                Site oficial <span aria-hidden>↗</span>
              </a>
            </li>
            <li>
              <a href={siteLinks.play} target="_blank" rel="noopener noreferrer">
                Versão de desenvolvimento <span aria-hidden>↗</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="label">Contato</p>
          <ul className={styles.list}>
            <li>
              <a href={siteLinks.contactMailto}>{siteLinks.contactEmail}</a>
            </li>
            <li>
              <Link href="/contato">Formulário de contato</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className={`wrap ${styles.copy}`}>{footerContent.copyright}</p>
    </footer>
  );
}
