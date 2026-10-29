import { describe, expect, it } from "vitest";
import { computeHeroLayout, isSplit, placeLabel, starPolygon } from "@/components/hero/heroLayout";

const LABEL = { labelW: 170, labelH: 46 };

function rectsIntersect(a: { x: number; y: number; w: number; h: number }, b: typeof a) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe("heroLayout", () => {
  it("usa composição dividida só em telas largas", () => {
    expect(isSplit(1440, 900)).toBe(true);
    expect(isSplit(1280, 800)).toBe(true);
    expect(isSplit(834, 1112)).toBe(false);
    expect(isSplit(390, 844)).toBe(false);
  });

  const cases = [
    { width: 1440, height: 900, copyRight: 640, copyTop: 0 },
    { width: 1280, height: 800, copyRight: 600, copyTop: 0 },
    { width: 834, height: 1112, copyRight: 0, copyTop: 700 },
    { width: 390, height: 844, copyRight: 0, copyTop: 470 },
    { width: 320, height: 640, copyRight: 0, copyTop: 330 }
  ];

  for (const c of cases) {
    it(`mantém estrelas e rótulos fora do texto em ${c.width}x${c.height}`, () => {
      const l = computeHeroLayout({ ...c, headerH: 68, ...LABEL });
      const copy =
        l.mode === "split"
          ? { x: 0, y: 0, w: c.copyRight, h: c.height }
          : { x: 0, y: c.copyTop, w: c.width, h: c.height - c.copyTop };
      expect(rectsIntersect(l.region, copy)).toBe(false);
      const labels = l.stars.map((s, i) => ({ ...placeLabel(s, l.sides[i], l, LABEL.labelW, LABEL.labelH), w: LABEL.labelW, h: LABEL.labelH }));
      for (const r of labels) {
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.x + r.w).toBeLessThanOrEqual(c.width);
        expect(rectsIntersect(r, copy)).toBe(false);
      }
      // rótulos não se sobrepõem entre si
      expect(rectsIntersect(labels[0], labels[1])).toBe(false);
      expect(rectsIntersect(labels[1], labels[2])).toBe(false);
      expect(rectsIntersect(labels[0], labels[2])).toBe(false);
    });
  }

  it("gera polígono de estrela com 8 vértices", () => {
    expect(starPolygon(100, 100, 40, 10).match(/px/g)).toHaveLength(16);
  });
});
