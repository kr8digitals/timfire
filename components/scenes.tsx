'use client';
import { useEffect, useRef } from 'react';

/**
 * HeroScenes — the living background of the homepage.
 *
 * Five hand-drawn canvas scenes sit deep behind the hero content and hand over
 * to one another on a slow cycle, so the background tells a changing story
 * about who TIMFIRE is instead of looping one effect forever:
 *
 *   0 constellation  — the network of people and ideas behind the work
 *   1 stage          — spotlights and an equaliser: the musical side
 *   2 terminal       — falling code: the developer
 *   3 agent graph    — nodes executing tasks: the AI agent builder
 *   4 waterfall      — falling light: motion and spoken word
 *
 * Everything is drawn at low alpha behind the copy (z-index 0, pointer-events
 * none), so it can never touch the hierarchy, the photograph or readability.
 * One requestAnimationFrame loop, capped device pixel ratio, paused while the
 * tab is hidden, and a single static frame under prefers-reduced-motion.
 */

const ORANGE = '242,122,26';
const WINE = '142,27,58';
const PAPER = '249,249,249';

const SCENE_MS = 20000;
const FADE_MS = 2600;

type World = {
  w: number;
  h: number;
  dots: { x: number; y: number; vx: number; vy: number; r: number }[];
  cols: { x: number; y: number; s: number; ch: string }[];
  streaks: { x: number; y: number; len: number; v: number; a: number }[];
  pulses: { edge: number; t: number }[];
  nodes: { x: number; y: number }[];
  edges: [number, number][];
  glyphChars: string;
};

function makeWorld(w: number, h: number): World {
  const rnd = mulberry(20261112);
  const dots = Array.from({ length: 64 }, () => ({
    x: rnd() * w,
    y: rnd() * h,
    vx: (rnd() - 0.5) * 0.16,
    vy: (rnd() - 0.5) * 0.16,
    r: 0.8 + rnd() * 1.8,
  }));
  const cols = Array.from({ length: Math.max(8, Math.floor(w / 90)) }, (_, i) => ({
    x: (i + 0.5) * (w / Math.max(8, Math.floor(w / 90))),
    y: rnd() * h,
    s: 0.5 + rnd() * 0.9,
    ch: '',
  }));
  const streaks = Array.from({ length: 34 }, () => ({
    x: rnd() * w,
    y: rnd() * h - h,
    len: 40 + rnd() * 130,
    v: 1.1 + rnd() * 2.2,
    a: 0.05 + rnd() * 0.1,
  }));
  const nodes = [
    { x: 0.16, y: 0.3 },
    { x: 0.34, y: 0.62 },
    { x: 0.5, y: 0.26 },
    { x: 0.66, y: 0.58 },
    { x: 0.82, y: 0.3 },
    { x: 0.5, y: 0.8 },
    { x: 0.24, y: 0.84 },
  ].map((p) => ({ x: p.x * w, y: p.y * h }));
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 5],
    [5, 3],
    [6, 5],
    [0, 2],
    [2, 4],
  ];
  return { w, h, dots, cols, streaks, pulses: [{ edge: 0, t: 0 }], nodes, edges, glyphChars: '01<>/{};=+*#' };
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── scenes ─────────────────────────────────────────────────────────────── */

function drawConstellation(ctx: CanvasRenderingContext2D, wd: World, t: number, a: number) {
  for (const d of wd.dots) {
    d.x += d.vx;
    d.y += d.vy;
    if (d.x < -10) d.x = wd.w + 10;
    if (d.x > wd.w + 10) d.x = -10;
    if (d.y < -10) d.y = wd.h + 10;
    if (d.y > wd.h + 10) d.y = -10;
  }
  ctx.lineWidth = 1;
  for (let i = 0; i < wd.dots.length; i++) {
    for (let j = i + 1; j < wd.dots.length; j++) {
      const p = wd.dots[i];
      const q = wd.dots[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 110) {
        ctx.strokeStyle = `rgba(${ORANGE},${a * 0.1 * (1 - dist / 110)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  }
  wd.dots.forEach((d, i) => {
    const tw = 0.5 + 0.5 * Math.sin(t / 900 + i);
    ctx.fillStyle = i % 9 === 0 ? `rgba(${WINE},${a * (0.25 + 0.2 * tw)})` : `rgba(${ORANGE},${a * (0.16 + 0.22 * tw)})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawStage(ctx: CanvasRenderingContext2D, wd: World, t: number, a: number) {
  const sway = Math.sin(t / 2600) * 0.22;
  const sway2 = Math.cos(t / 3100) * 0.22;
  for (const [origin, angle, col] of [
    [{ x: wd.w * 0.18, y: -40 }, sway, ORANGE],
    [{ x: wd.w * 0.82, y: -40 }, sway2, WINE],
  ] as [{ x: number; y: number }, number, string][]) {
    const spread = 0.34;
    const dir = Math.PI / 2 + angle;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + Math.cos(dir - spread) * wd.h * 1.5, origin.y + Math.sin(dir - spread) * wd.h * 1.5);
    ctx.lineTo(origin.x + Math.cos(dir + spread) * wd.h * 1.5, origin.y + Math.sin(dir + spread) * wd.h * 1.5);
    ctx.closePath();
    const g = ctx.createLinearGradient(origin.x, origin.y, origin.x, wd.h);
    g.addColorStop(0, `rgba(${col},${a * 0.14})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.fill();
  }
  const bars = 28;
  const bw = wd.w / bars;
  for (let i = 0; i < bars; i++) {
    const hgt = (0.06 + 0.1 * Math.abs(Math.sin(t / 620 + i * 0.7)) + 0.04 * Math.abs(Math.sin(t / 240 + i))) * wd.h;
    ctx.fillStyle = `rgba(${i % 4 === 0 ? WINE : ORANGE},${a * 0.12})`;
    ctx.fillRect(i * bw + bw * 0.22, wd.h - hgt, bw * 0.56, hgt);
  }
}

function drawTerminal(ctx: CanvasRenderingContext2D, wd: World, t: number, a: number) {
  ctx.font = '13px ui-monospace, monospace';
  for (const c of wd.cols) {
    c.y += c.s;
    if (c.y > wd.h + 20) {
      c.y = -20;
      c.ch = wd.glyphChars[Math.floor((t / 90 + c.x) % wd.glyphChars.length)];
    }
    const trail = 7;
    for (let k = 0; k < trail; k++) {
      const y = c.y - k * 16;
      if (y < 0) continue;
      const ch = wd.glyphChars[Math.floor(c.x + y / 16 + k) % wd.glyphChars.length];
      ctx.fillStyle = `rgba(${k === 0 ? PAPER : ORANGE},${a * (k === 0 ? 0.2 : 0.13 * (1 - k / trail))})`;
      ctx.fillText(ch, c.x, y);
    }
  }
}

function drawAgent(ctx: CanvasRenderingContext2D, wd: World, t: number, a: number) {
  ctx.lineWidth = 1;
  wd.edges.forEach(([i, j], ei) => {
    const p = wd.nodes[i];
    const q = wd.nodes[j];
    ctx.strokeStyle = `rgba(${PAPER},${a * 0.07})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
    void ei;
  });
  if (wd.pulses.length < 4 && Math.random() < 0.012) {
    wd.pulses.push({ edge: Math.floor(Math.random() * wd.edges.length), t: 0 });
  }
  wd.pulses = wd.pulses.filter((p) => p.t <= 1);
  for (const p of wd.pulses) {
    p.t += 0.006;
    const [i, j] = wd.edges[p.edge];
    const x = wd.nodes[i].x + (wd.nodes[j].x - wd.nodes[i].x) * p.t;
    const y = wd.nodes[i].y + (wd.nodes[j].y - wd.nodes[i].y) * p.t;
    ctx.fillStyle = `rgba(${ORANGE},${a * 0.5 * (1 - Math.abs(p.t - 0.5) * 1.4)})`;
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  wd.nodes.forEach((n, i) => {
    const pulse = 0.5 + 0.5 * Math.sin(t / 700 + i * 1.3);
    ctx.strokeStyle = `rgba(${i % 3 === 0 ? WINE : ORANGE},${a * (0.18 + 0.2 * pulse)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 7 + pulse * 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(${ORANGE},${a * 0.35})`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawWaterfall(ctx: CanvasRenderingContext2D, wd: World, _t: number, a: number) {
  for (const s of wd.streaks) {
    s.y += s.v;
    if (s.y - s.len > wd.h) {
      s.y = -s.len;
      s.x = Math.random() * wd.w;
    }
    const g = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y);
    g.addColorStop(0, `rgba(${ORANGE},0)`);
    g.addColorStop(1, `rgba(${ORANGE},${a * s.a})`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - s.len);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  }
  for (let r = 0; r < 3; r++) {
    const y = wd.h - 26 - r * 20;
    ctx.strokeStyle = `rgba(${WINE},${a * (0.1 - r * 0.025)})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= wd.w; x += 24) ctx.lineTo(x, y + Math.sin(x / 60 + r) * 3);
    ctx.stroke();
  }
}

const SCENES = [drawConstellation, drawStage, drawTerminal, drawAgent, drawWaterfall];

export default function HeroScenes() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let world = makeWorld(1, 1);
    let raf = 0;
    let running = true;

    function size() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      world = makeWorld(rect.width, rect.height);
    }

    function envelope(local: number) {
      return Math.max(0, Math.min(1, local / FADE_MS, (SCENE_MS - local) / FADE_MS));
    }

    function frame(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);
      const cycle = now % (SCENE_MS * SCENES.length);
      const idx = Math.floor(cycle / SCENE_MS);
      const local = cycle % SCENE_MS;
      const a = envelope(local);
      const prev = (idx + SCENES.length - 1) % SCENES.length;
      if (local < FADE_MS) SCENES[prev](ctx!, world, now, (1 - local / FADE_MS) * 0.9);
      SCENES[idx % SCENES.length](ctx!, world, now, a * 0.9);
    }

    size();
    window.addEventListener('resize', size);

    if (reduce) {
      const rect = canvas.getBoundingClientRect();
      SCENES[0](ctx, world, 1200, 0.8);
      void rect;
      return () => window.removeEventListener('resize', size);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, []);

  return <canvas ref={ref} className="hero-scenes" aria-hidden="true" />;
}
