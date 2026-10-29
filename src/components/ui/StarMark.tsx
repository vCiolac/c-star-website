type StarMarkProps = {
  className?: string;
  color?: string;
  title?: string;
};

/** Estrela de 4 pontas da C-STAR (mesmo desenho do favicon). */
export function StarMark({ className, color = "#fbbf24", title }: StarMarkProps) {
  return (
    <svg
      className={className}
      viewBox="-32 -32 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M0 -30 Q4 -4 30 0 Q4 4 0 30 Q-4 4 -30 0 Q-4 -4 0 -30Z" fill={color} />
      <circle r="4.5" fill="#fff8e1" />
    </svg>
  );
}
