import styles from "./PageIntro.module.css";

type Props = {
  kicker: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
};

/** Abertura padrão das páginas internas (com céu estrelado leve em CSS). */
export function PageIntro({ kicker, title, lead, children }: Props) {
  return (
    <header className={styles.intro}>
      <div className={styles.sky} aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <span className="label accent-gold">{kicker}</span>
        <h1 className="t-hero">{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
        {children}
      </div>
    </header>
  );
}
