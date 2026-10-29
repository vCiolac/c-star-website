import Link from "next/link";
import { cn, isExternalUrl } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "ghost";
  size?: "md" | "sm";
  className?: string;
  /** Texto extra só para leitores de tela (ex.: "abre em nova aba"). */
  srHint?: string;
};

/** Link com aparência de botão. Links externos abrem em nova aba com rel seguro. */
export function Button({ href, children, variant = "gold", size = "md", className, srHint }: ButtonProps) {
  const external = isExternalUrl(href);
  const cls = cn("btn", variant === "gold" ? "btn-gold" : "btn-ghost", size === "sm" && "btn-sm", className);
  const hint = srHint ?? (external ? "(abre em nova aba)" : undefined);

  const content = (
    <>
      {children}
      {external ? <span aria-hidden>↗</span> : null}
      {hint ? <span className="sr-only">{hint}</span> : null}
    </>
  );

  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {content}
    </Link>
  );
}
