/**
 * Cena WebGL da constelação (three.js puro). Carregada via import() dinâmico
 * pelo HeroConstellation, então fica fora do bundle inicial.
 *
 * Coordenadas: as três estrelas são posicionadas a partir de pontos em pixels
 * calculados pelo layout (heroLayout.ts), "desprojetando" cada ponto na sua
 * profundidade. Assim o texto nunca cobre estrelas/rótulos e a cena continua
 * em 3D (profundidades diferentes, parallax, dolly).
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
  type Texture
} from "three";
import type { Point } from "./heroLayout";

export type SceneState = {
  /** 0..1: estrelas acendendo por profundidade */
  reveal: number;
  /** 0..1: linhas da constelação sendo desenhadas */
  draw: number;
  /** 0..~1: brilho da estrela de 4 pontas central */
  flare: number;
  /** 0..1: progresso do dolly (scroll) */
  dolly: number;
  /** -1..1: ponteiro suavizado */
  ptrX: number;
  ptrY: number;
};

export type ConstellationScene = {
  setSize(width: number, height: number): void;
  setTargets(stars: Point[], center: Point): void;
  render(timeSec: number, dtMs: number, state: SceneState): void;
  /** Projeta a estrela i para pixels da tela; null se atrás da câmera. */
  project(index: number): Point | null;
  dispose(): void;
};

const FOV = 58;
const CAM_Z = 62;
const STAR_Z = [4, -4, 6];
const CENTER_Z = -46;
const STAR_COLORS = [0x38bdf8, 0xfbbf24, 0xfb7185];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(size: number, paint: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (g) paint(g, size);
  return new CanvasTexture(c);
}

function glowTexture() {
  return canvasTexture(128, (g, s) => {
    const h = s / 2;
    const r = g.createRadialGradient(h, h, 0, h, h, h);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.18, "rgba(255,255,255,.55)");
    r.addColorStop(0.45, "rgba(255,255,255,.12)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, s, s);
  });
}

function nebulaTexture(rgb: string, rand: () => number) {
  return canvasTexture(256, (g) => {
    for (let i = 0; i < 7; i++) {
      const x = 60 + rand() * 136;
      const y = 60 + rand() * 136;
      const r = 50 + rand() * 80;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${rgb},${0.26 + rand() * 0.2})`);
      gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 256);
    }
  });
}

function star4Texture() {
  return canvasTexture(256, (g, s) => {
    const m = s / 2;
    const gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, "rgba(255,240,190,.85)");
    gr.addColorStop(0.22, "rgba(251,191,36,.32)");
    gr.addColorStop(1, "rgba(251,191,36,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    const R = 112;
    const q = 12;
    g.beginPath();
    g.moveTo(m, m - R);
    g.quadraticCurveTo(m + q, m - q, m + R, m);
    g.quadraticCurveTo(m + q, m + q, m, m + R);
    g.quadraticCurveTo(m - q, m + q, m - R, m);
    g.quadraticCurveTo(m - q, m - q, m, m - R);
    g.closePath();
    g.shadowColor = "#fbbf24";
    g.shadowBlur = 22;
    g.fillStyle = "#fff6d8";
    g.fill();
  });
}

const VERT = /* glsl */ `
attribute float aSize; attribute vec3 aColor; attribute float aDelay; attribute float aTw;
uniform float uTime; uniform float uReveal; uniform float uPR;
varying vec3 vC; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  gl_Position = projectionMatrix * mv;
  float d = -mv.z;
  gl_PointSize = clamp(aSize * uPR * (280. / max(d, 1.)), 0., 42.);
  float t = .72 + .28 * sin(uTime * 1.6 + aTw);
  float rv = clamp((uReveal * 1.35 - aDelay) / .35, 0., 1.);
  vA = t * rv * smoothstep(1.5, 12., d);
  vC = aColor;
}`;

const FRAG = /* glsl */ `
varying vec3 vC; varying float vA;
void main(){
  vec2 p = gl_PointCoord - .5;
  float a = smoothstep(.5, 0., length(p));
  a *= a;
  gl_FragColor = vec4(vC * a * vA, 1.);
}`;

export function createConstellationScene(
  canvas: HTMLCanvasElement,
  opts: { small: boolean }
): ConstellationScene {
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x020617, 1);

  const scene = new Scene();
  const cam = new PerspectiveCamera(FOV, 1, 0.1, 1400);
  cam.position.set(0, 0, CAM_Z);

  const rand = mulberry32(20261029);
  const textures: Texture[] = [];
  const disposables: { dispose(): void }[] = [];

  /* campo de estrelas */
  const N = opts.small ? 1400 : 4200;
  const pos = new Float32Array(N * 3);
  const siz = new Float32Array(N);
  const col = new Float32Array(N * 3);
  const dly = new Float32Array(N);
  const tw = new Float32Array(N);
  const pal = [
    [1, 1, 1],
    [1, 1, 1],
    [0.78, 0.9, 1],
    [0.22, 0.74, 0.97],
    [0.98, 0.75, 0.14],
    [0.98, 0.44, 0.52],
    [0.6, 0.5, 1]
  ];
  for (let i = 0; i < N; i++) {
    const z = 80 - rand() * 540;
    pos[i * 3] = (rand() - 0.5) * 280;
    pos[i * 3 + 1] = (rand() - 0.5) * 170;
    pos[i * 3 + 2] = z;
    siz[i] = rand() < 0.035 ? 2.8 + rand() * 2.2 : 0.55 + rand() * 1.3;
    col.set(pal[Math.floor(rand() * pal.length)], i * 3);
    dly[i] = (80 - z) / 540;
    tw[i] = rand() * Math.PI * 2;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new BufferAttribute(siz, 1));
  geo.setAttribute("aColor", new BufferAttribute(col, 3));
  geo.setAttribute("aDelay", new BufferAttribute(dly, 1));
  geo.setAttribute("aTw", new BufferAttribute(tw, 1));
  const mat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uReveal: { value: 0 }, uPR: { value: renderer.getPixelRatio() } },
    vertexShader: VERT,
    fragmentShader: FRAG
  });
  const points = new Points(geo, mat);
  scene.add(points);
  disposables.push(geo, mat);

  /* nebulosas */
  const nebs: Mesh[] = [];
  const nebPlane = new PlaneGeometry(420, 300);
  disposables.push(nebPlane);
  (
    [
      ["124,58,237", -170, 0],
      ["56,189,248", -260, 1.2],
      ["251,113,133", -330, 2.4],
      ["124,58,237", -420, 0.6]
    ] as const
  ).forEach(([rgb, z, rot], i) => {
    const tex = nebulaTexture(rgb, rand);
    textures.push(tex);
    const m = new MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.3, depthWrite: false, blending: AdditiveBlending });
    disposables.push(m);
    const mesh = new Mesh(nebPlane, m);
    mesh.position.set(i % 2 ? 40 : -50, i % 2 ? -10 : 20, z);
    mesh.rotation.z = rot;
    scene.add(mesh);
    nebs.push(mesh);
  });

  /* as três estrelas (criadores) */
  const glow = glowTexture();
  textures.push(glow);
  const mkSprite = (color: number, scale: number, map: Texture = glow) => {
    const m = new SpriteMaterial({ map, color, transparent: true, depthWrite: false, blending: AdditiveBlending });
    disposables.push(m);
    const s = new Sprite(m);
    s.scale.setScalar(scale);
    scene.add(s);
    return s;
  };
  const starPos = STAR_Z.map((z) => new Vector3(0, 0, z));
  const center = new Vector3(0, 0, CENTER_Z);
  const stars = STAR_COLORS.map((c) => [mkSprite(c, 9), mkSprite(0xffffff, 2.6)] as const);

  type L = { line: Line; a: Vector3; b: Vector3 };
  const lines: L[] = [];
  const mkLine = (a: Vector3, b: Vector3, color: number, opacity: number) => {
    const g = new BufferGeometry().setFromPoints([a.clone(), a.clone()]);
    const m = new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: AdditiveBlending });
    disposables.push(g, m);
    const line = new Line(g, m);
    scene.add(line);
    lines.push({ line, a, b });
  };
  mkLine(starPos[0], starPos[1], 0xbfe8ff, 0.7);
  mkLine(starPos[1], starPos[2], 0xbfe8ff, 0.7);
  mkLine(starPos[2], starPos[0], 0xbfe8ff, 0.7);
  starPos.forEach((p) => mkLine(p, center, 0xfbbf24, 0.22));

  const pulses = [0, 1, 2].map(() => mkSprite(0xfde68a, 1.6));
  const s4 = star4Texture();
  textures.push(s4);
  const centerStar = mkSprite(0xffffff, 10, s4);

  const tmp = new Vector3();
  let width = 1;
  let height = 1;

  function halfHeightAt(z: number) {
    return Math.tan(((FOV / 2) * Math.PI) / 180) * (CAM_Z - z);
  }

  function unproject(p: Point, z: number, out: Vector3) {
    const hh = halfHeightAt(z);
    const hw = hh * (width / height);
    out.set((p.x / width) * 2 * hw - hw, hh - (p.y / height) * 2 * hh, z);
  }

  return {
    setSize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setSize(width, height, false);
      cam.aspect = width / height;
      cam.updateProjectionMatrix();
      mat.uniforms.uPR.value = renderer.getPixelRatio();
    },

    setTargets(targets, c) {
      targets.forEach((p, i) => {
        unproject(p, STAR_Z[i], starPos[i]);
        stars[i][0].position.copy(starPos[i]);
        stars[i][1].position.copy(starPos[i]);
      });
      unproject(c, CENTER_Z, center);
      centerStar.position.copy(center);
    },

    render(t, dt, s) {
      const d = s.dolly;
      // A câmera só translada (sem girar): no fim do dolly fica de frente para o centro.
      const fall = 1 - d * 0.85;
      cam.position.set(center.x * d + s.ptrX * 1.6 * fall, center.y * d - s.ptrY * 1.1 * fall, CAM_Z - d * 100);
      cam.updateMatrixWorld();

      mat.uniforms.uTime.value = t;
      mat.uniforms.uReveal.value = s.reveal;

      for (const L of lines) {
        const p = L.line.geometry.attributes.position as BufferAttribute;
        tmp.copy(L.a).lerp(L.b, s.draw);
        p.setXYZ(0, L.a.x, L.a.y, L.a.z);
        p.setXYZ(1, tmp.x, tmp.y, tmp.z);
        p.needsUpdate = true;
      }
      stars.forEach(([g, core], i) => {
        const k = Math.min(1, Math.max(0, s.reveal * 1.6 - 0.3 - i * 0.15));
        g.material.opacity = k * (0.85 + 0.15 * Math.sin(t * 2 + i));
        core.material.opacity = k;
      });
      pulses.forEach((p, i) => {
        const u = (t * 0.12 + i / 3) % 1;
        p.position.copy(starPos[i]).lerp(starPos[(i + 1) % 3], u);
        p.material.opacity = s.draw * (1 - Math.abs(u - 0.5) * 2) * 0.9;
      });
      centerStar.scale.setScalar(10 * (0.4 + s.flare * 1.1) + Math.sin(t * 1.3) * 0.4);
      centerStar.material.opacity = Math.min(1, s.flare * 1.4);
      centerStar.material.rotation = t * 0.05;
      points.rotation.z += dt * 0.000012;
      nebs.forEach((n, i) => {
        n.rotation.z += dt * 0.000008 * (i % 2 ? 1 : -1);
      });

      renderer.render(scene, cam);
    },

    project(i) {
      tmp.copy(starPos[i]).project(cam);
      if (tmp.z > 1 || tmp.z < -1) return null;
      return { x: (tmp.x * 0.5 + 0.5) * width, y: (-tmp.y * 0.5 + 0.5) * height };
    },

    dispose() {
      disposables.forEach((d) => d.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    }
  };
}
