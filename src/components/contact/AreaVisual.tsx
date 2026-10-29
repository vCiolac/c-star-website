import { StarMark } from "@/components/ui/StarMark";
import type { ContactArea } from "@/content/contact";
import { cn } from "@/lib/utils";
import styles from "./AreaVisual.module.css";

const COLOR = { gold: "#fbbf24", portal: "#38bdf8", rose: "#fb7185" } as const;

/** Elemento cinematográfico leve (CSS 3D/SVG) de cada área de contato. Decorativo. */
export function AreaVisual({
  visual,
  color,
  className
}: Pick<ContactArea, "visual" | "color"> & { className?: string }) {
  const c = COLOR[color];
  return (
    <div className={cn(styles.root, className)} style={{ "--c": c } as React.CSSProperties} aria-hidden="true">
      <div className={styles.field} />
      {visual === "orbit" ? (
        <div className={styles.orbitScene}>
          <div className={styles.planet} />
          <div className={cn(styles.ring, styles.ringA)}>
            <i />
          </div>
          <div className={cn(styles.ring, styles.ringB)}>
            <i />
          </div>
        </div>
      ) : null}
      {visual === "signal" ? (
        <div className={styles.signal}>
          <span />
          <span />
          <span />
          <StarMark className={styles.signalStar} color={c} />
        </div>
      ) : null}
      {visual === "cluster" ? (
        <svg className={styles.cluster} viewBox="0 0 200 200">
          <g stroke={c} strokeOpacity=".45" strokeWidth="1" fill="none">
            <path d="M40 140 L78 70 L130 96 L162 44" />
            <path d="M78 70 L104 150 L130 96" />
          </g>
          {[
            [40, 140, 3],
            [78, 70, 4],
            [130, 96, 3.5],
            [162, 44, 3],
            [104, 150, 3]
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#fff" className={styles.twinkle} style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
          <g transform="translate(130 96) scale(.5)">
            <path d="M0 -30 Q4 -4 30 0 Q4 4 0 30 Q-4 4 -30 0 Q-4 -4 0 -30Z" fill={c} />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
