import { ImageResponse } from "next/og";

export const alt = "C-STAR Studios, criadores de MUFF Origem";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STARS = [
  [120, 90, 2],
  [260, 520, 1.5],
  [420, 140, 1],
  [980, 80, 2],
  [1080, 420, 1.5],
  [760, 560, 1],
  [600, 60, 1],
  [1140, 250, 1]
] as const;

/** Imagem Open Graph gerada no build (constelação dos três criadores). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(circle at 72% 40%, #1b1450 0%, #080b1f 45%, #020617 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif"
        }}
      >
        {STARS.map(([x, y, r], i) => (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: y, width: r * 3, height: r * 3, borderRadius: 99, background: "#fff" }}
          />
        ))}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M760 200 L1040 150 L900 440 Z" fill="none" stroke="rgba(191,232,255,.6)" strokeWidth="2" />
          <circle cx="760" cy="200" r="12" fill="#38bdf8" />
          <circle cx="1040" cy="150" r="12" fill="#fbbf24" />
          <circle cx="900" cy="440" r="12" fill="#fb7185" />
          <path d="M900 236 Q906 258 928 264 Q906 270 900 292 Q894 270 872 264 Q894 258 900 236Z" fill="#fff6d8" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 700 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#fbbf24", textTransform: "uppercase" }}>C-STAR Studios</div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.02, marginTop: 24, letterSpacing: -2 }}>
            Três criadores. Um mundo para habitar.
          </div>
          <div style={{ fontSize: 28, color: "#cbd5e1", marginTop: 28 }}>Criadores de MUFF Origem</div>
        </div>
      </div>
    ),
    size
  );
}
