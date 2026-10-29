import { cn } from "@/lib/utils";

type SpriteProps = {
  /** Tira horizontal de quadros quadrados (altura = lado do quadro). */
  src: string;
  frames: number;
  /** Lado do quadro exibido, em px. */
  size: number;
  label?: string;
  /** Espelha horizontalmente quando o visual real do clipe olha para o outro lado. */
  flip?: boolean;
  className?: string;
};

/** Sprite pixel art animado só com CSS (steps). Pausa naturalmente com movimento reduzido. */
export function Sprite({ src, frames, size, label, flip, className }: SpriteProps) {
  return (
    <div
      className={cn("sprite", className)}
      data-flip={flip ? "true" : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={
        {
          "--f": size,
          "--n": frames,
          backgroundImage: `url(${src})`
        } as React.CSSProperties
      }
    />
  );
}
