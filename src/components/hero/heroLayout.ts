/**
 * Layout puro (sem DOM) do hero da constelação. Testável em node.
 *
 * - "split" (desktop/paisagem): texto à esquerda, constelação emoldurada à direita.
 * - "stacked" (mobile/tablet retrato): constelação em cima, texto embaixo.
 * As estrelas e seus rótulos ficam sempre dentro de `region`, que nunca
 * intersecta o bloco de texto.
 */

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type LabelSide = "above" | "below";

export type HeroLayout = {
  mode: "split" | "stacked";
  region: Rect;
  stars: Point[];
  center: Point;
  sides: LabelSide[];
  /** Distância vertical entre o centro da estrela e a borda do rótulo. */
  labelGap: number;
};

export type HeroLayoutInput = {
  width: number;
  height: number;
  headerH: number;
  /** Topo do bloco de texto (modo stacked), relativo ao palco. */
  copyTop: number;
  /** Borda direita do bloco de texto (modo split), relativa ao palco. */
  copyRight: number;
  labelW: number;
  labelH: number;
};

/** Mesmo critério da media query CSS `(min-width: 960px) and (min-aspect-ratio: 11/10)`. */
export function isSplit(width: number, height: number) {
  return width >= 960 && width / Math.max(1, height) >= 1.1;
}

/** Posições relativas (0..1) das estrelas Victor, Juan, Rodrigo dentro da área útil. */
const REL_SPLIT: Point[] = [
  { x: 0.06, y: 0.12 },
  { x: 0.94, y: 0.02 },
  { x: 0.56, y: 0.98 }
];
const SIDES_SPLIT: LabelSide[] = ["above", "above", "below"];
// Em telas estreitas os rótulos de cima colidiriam: Victor desce e leva o rótulo para baixo.
const REL_STACKED: Point[] = [
  { x: 0.02, y: 0.34 },
  { x: 0.98, y: 0.0 },
  { x: 0.5, y: 1 }
];
const SIDES_STACKED: LabelSide[] = ["below", "above", "below"];

export function computeHeroLayout(i: HeroLayoutInput): HeroLayout {
  const split = isSplit(i.width, i.height);
  const gutter = i.width >= 640 ? 32 : 16;
  const labelGap = split ? 22 : 16;

  const region: Rect = split
    ? (() => {
        const x = Math.max(i.copyRight + 40, i.width * 0.48);
        const y = i.headerH + 24;
        return { x, y, w: Math.max(120, i.width - gutter - x), h: Math.max(120, i.height - y - 56) };
      })()
    : (() => {
        const y = i.headerH + 8;
        return { x: gutter, y, w: Math.max(120, i.width - gutter * 2), h: Math.max(110, i.copyTop - 16 - y) };
      })();

  // Área útil: descontar metade do rótulo nas laterais e o rótulo inteiro em cima/embaixo.
  const padX = i.labelW / 2;
  const padY = i.labelH + labelGap;
  let inner: Rect = {
    x: region.x + padX,
    y: region.y + padY,
    w: Math.max(40, region.w - padX * 2),
    h: Math.max(24, region.h - padY * 2)
  };

  // Mantém o triângulo com proporção agradável (nem achatado demais, nem alto demais).
  const maxW = inner.h * 1.7;
  const maxH = inner.w * 1.05;
  if (inner.w > maxW) inner = { ...inner, x: inner.x + (inner.w - maxW) / 2, w: maxW };
  if (inner.h > maxH) inner = { ...inner, y: inner.y + (inner.h - maxH) / 2, h: maxH };

  const REL = split ? REL_SPLIT : REL_STACKED;
  const stars = REL.map((p) => ({ x: inner.x + p.x * inner.w, y: inner.y + p.y * inner.h }));
  if (!split) {
    // Rótulos de Victor e Rodrigo ficam abaixo das estrelas: garante folga vertical entre eles.
    stars[0].y = Math.max(inner.y, Math.min(stars[0].y, stars[2].y - i.labelH - 6));
  }
  const center = {
    x: (stars[0].x + stars[1].x + stars[2].x) / 3,
    y: (stars[0].y + stars[1].y + stars[2].y) / 3
  };

  return { mode: split ? "split" : "stacked", region, stars, center, sides: split ? SIDES_SPLIT : SIDES_STACKED, labelGap };
}

/** Posição (canto superior esquerdo) de um rótulo, presa dentro da região. */
export function placeLabel(star: Point, side: LabelSide, layout: HeroLayout, w: number, h: number): Point {
  const r = layout.region;
  const x = Math.min(Math.max(star.x - w / 2, r.x), r.x + r.w - w);
  const rawY = side === "above" ? star.y - layout.labelGap - h : star.y + layout.labelGap;
  const y = Math.min(Math.max(rawY, r.y), r.y + r.h - h);
  return { x, y };
}

/** clip-path de estrela de 4 pontas centrada (r = raio da ponta, k = cintura). */
export function starPolygon(w: number, h: number, r: number, k: number) {
  const cx = w / 2;
  const cy = h / 2;
  const pts: [number, number][] = [
    [cx, cy - r],
    [cx + k, cy - k],
    [cx + r, cy],
    [cx + k, cy + k],
    [cx, cy + r],
    [cx - k, cy + k],
    [cx - r, cy],
    [cx - k, cy - k]
  ];
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
