#!/usr/bin/env node
/**
 * QA visual automatizado (playwright-core + Chrome instalado).
 *
 * Uso: com o build de produção rodando (`npm run build && npx next start -p 3301`):
 *   QA_OUT=<pasta> node scripts/qa/visual-qa.mjs
 * Variáveis: QA_BASE (padrão http://localhost:3301), QA_OUT (pasta de screenshots),
 *            QA_CHROME (caminho do Chrome), QA_ROUTES (lista separada por vírgula).
 *
 * Para cada rota × viewport: screenshot full-page + primeira dobra e checagens:
 *  (a) sem overflow horizontal, (b) texto visível fora da viewport no eixo X,
 *  (c) headings sobrepostos a outros headings/parágrafos, (d) erros de console,
 *  (e) imagens quebradas, (f) rótulos do hero sobre o texto do hero.
 * Extras: movimento reduzido em 390 e uma execução com WebGL desabilitado.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.QA_BASE ?? "http://localhost:3301";
const OUT = process.env.QA_OUT ?? join(process.cwd(), ".qa");
const CHROME = process.env.QA_CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ROUTES = (process.env.QA_ROUTES ?? "/,/projetos,/projetos/muff,/contato").split(",");
const VIEWPORTS = [
  [1440, 900],
  [1280, 800],
  [834, 1112],
  [390, 844],
  [320, 640]
];

mkdirSync(OUT, { recursive: true });
const slug = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/\//g, "_"));

/** Roda dentro da página: coleta problemas de layout. */
function inspect() {
  const vw = window.innerWidth;
  const issues = [];
  const effOpacity = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return 0;
      o *= parseFloat(cs.opacity);
    }
    return o;
  };
  /** Parte do retângulo realmente visível após recortes dos ancestrais (overflow/clip-path). */
  const visibleRect = (el) => {
    const r = el.getBoundingClientRect();
    let l = r.left;
    let rt = r.right;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) {
        const cr = n.getBoundingClientRect();
        l = Math.max(l, cr.left);
        rt = Math.min(rt, cr.right);
      }
    }
    return { left: l, right: rt, empty: rt - l <= 0 };
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && effOpacity(el) > 0.05;
  };
  const label = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.textContent || "").trim().slice(0, 40)}"`;

  // (a)
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1) issues.push(`overflow horizontal: scrollWidth ${sw} > ${vw}`);

  // (b)
  const textEls = [...document.body.querySelectorAll("*")].filter(
    (el) =>
      !["SCRIPT", "STYLE", "SVG", "NOSCRIPT"].includes(el.tagName) &&
      [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) &&
      !el.closest(".sr-only, .skip-link, [aria-hidden='true'] svg")
  );
  for (const el of textEls) {
    if (!visible(el)) continue;
    if (el.closest("[aria-hidden='true']")) continue; // decorativo/oculto (ex.: honeypot)
    const r = visibleRect(el);
    if (r.empty || (r.left >= -1 && r.right <= vw + 1)) continue;
    issues.push(`texto fora da viewport X: ${label(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
  }

  // (c)
  const blocks = [...document.querySelectorAll("h1,h2,h3,h4,p")].filter(
    (el) => visible(el) && !el.closest(".sr-only") && (el.textContent || "").trim()
  );
  const heads = blocks.filter((el) => /^H[1-4]$/.test(el.tagName));
  const inter = (a, b) => {
    const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return x * y;
  };
  for (const h of heads) {
    const hr = h.getBoundingClientRect();
    for (const o of blocks) {
      if (o === h || o.contains(h) || h.contains(o)) continue;
      const a = inter(hr, o.getBoundingClientRect());
      if (a > 8) issues.push(`sobreposição: ${label(h)} × ${label(o)} (${Math.round(a)}px²)`);
    }
  }

  // (e)
  for (const img of document.images) {
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) issues.push(`imagem quebrada: ${img.currentSrc}`);
  }

  // (f) rótulos do hero × texto do hero (só na primeira dobra)
  const hero = document.querySelector("section[aria-labelledby='hero-title']");
  if (hero && window.scrollY < 10) {
    const labels = [...hero.querySelectorAll("ul li > span")].filter(visible);
    const copy = [...hero.querySelectorAll("h1, p, a.btn, .label")].filter(visible).filter((e) => !e.closest("ul"));
    for (const l of labels) {
      const lr = l.getBoundingClientRect();
      if (lr.right > vw + 1 || lr.left < -1) issues.push(`rótulo do hero cortado: ${label(l)}`);
      for (const c of copy) {
        if (inter(lr, c.getBoundingClientRect()) > 4) issues.push(`rótulo do hero sobre o texto: ${label(l)} × ${label(c)}`);
      }
    }
    for (let i = 0; i < labels.length; i++)
      for (let j = i + 1; j < labels.length; j++)
        if (inter(labels[i].getBoundingClientRect(), labels[j].getBoundingClientRect()) > 4)
          issues.push(`rótulos do hero sobrepostos: ${label(labels[i])} × ${label(labels[j])}`);
  }
  return issues;
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
}

async function run({ name, args = [], reducedMotion = "no-preference", viewports = VIEWPORTS, routes = ROUTES }) {
  const browser = await chromium.launch({ executablePath: CHROME, args });
  const results = [];
  for (const [w, h] of viewports) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion, deviceScaleFactor: 1 });
    for (const route of routes) {
      const page = await ctx.newPage();
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(route === "/" ? 4200 : 1200); // coreografia de entrada
      const fold = await page.evaluate(inspect);
      const tag = `${slug(route)}-${w}${name === "padrão" ? "" : "-" + name}`;
      await page.screenshot({ path: join(OUT, `${tag}-fold.png`) });
      await scrollThrough(page);
      const full = await page.evaluate(inspect);
      // quadros da viewport em posições de scroll (seções fixadas não aparecem no full-page)
      if (route === "/" || route === "/projetos/muff") {
        const frames = route === "/" ? [0.9, 1.6, 2.4, 3.4, 4.6, 5.6] : [2.5, 3.5, 4.5];
        for (const k of frames) {
          await page.evaluate((y) => window.scrollTo(0, y), Math.round(k * h));
          await page.waitForTimeout(900);
          const mid = await page.evaluate(inspect);
          mid.forEach((m) => full.push(`[scroll ${k}] ${m}`));
          await page.screenshot({ path: join(OUT, `${tag}-s${k}.png`) });
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });
      const issues = [...new Set([...fold, ...full])];
      errors.forEach((e) => issues.push(`console: ${e.slice(0, 160)}`));
      results.push({ run: name, route, viewport: `${w}x${h}`, issues });
      console.log(`${issues.length ? "✗" : "✓"} [${name}] ${route} @${w}x${h}${issues.length ? "\n   - " + issues.join("\n   - ") : ""}`);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  return results;
}

const all = [
  ...(await run({ name: "padrão" })),
  ...(await run({ name: "rm", reducedMotion: "reduce", viewports: [[390, 844]] })),
  ...(await run({ name: "nogl", args: ["--disable-webgl", "--disable-3d-apis"], viewports: [[1440, 900], [390, 844]], routes: ["/"] }))
];
writeFileSync(join(OUT, "report.json"), JSON.stringify(all, null, 2));
const failed = all.filter((r) => r.issues.length);
console.log(`\n${all.length - failed.length}/${all.length} execuções sem problemas. Screenshots em ${OUT}`);
process.exitCode = failed.length ? 1 : 0;
