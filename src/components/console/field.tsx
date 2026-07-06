"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { caseStudies, layers, scratchIndex } from "@/data/portfolio";
import { LAYER_HINTS, PROJECT_HINTS } from "@/lib/intents";
import type { ArtifactSpec } from "@/lib/protocol";

/**
 * The constellation — every point is one of Divanshu's real systems, and
 * the sky is an effect engine:
 *
 *   ignite     stars are born cluster-by-cluster on load
 *   drift      ambient motion + slow cluster breathing + twinkle
 *   parallax   the whole sky leans away from the pointer
 *   meteor     an occasional shooting star
 *   stir       typing lights matching stars and threads them together
 *   scan       an astrolabe ring sweeps the sky when a run starts
 *   comets     the cited stars fly to the card as ink comets with trails
 *   ripple     the card surface ripples where a comet lands
 *   sparks     dismissing an answer scatters it back into the sky
 *   burst      `sudo hire` detonates a small red starburst
 *   ward       a quarantined query seals the card behind a contracting ring
 *   dream      left alone, the sky quietly re-draws one constellation
 *
 * Everything collapses to a static chart under prefers-reduced-motion.
 */

export interface FieldNode {
  id: string;
  label: string;
  sub: string;
  url: string;
  cluster: number;
}

// Cluster anchors (stage fractions), keeping the center clear for the card.
const CLUSTER_POS: [number, number][] = [
  [0.14, 0.3], // Modeling & training
  [0.12, 0.74], // Alignment & fine-tuning
  [0.87, 0.28], // Inference & serving
  [0.88, 0.72], // Retrieval & data
  [0.3, 0.1], // Evaluation & safety
  [0.62, 0.09], // Case studies
];

// Engraved chart labels, one per cluster — the atlas names its regions.
const CLUSTER_LABELS = [
  "MODELING",
  "ALIGNMENT",
  "SERVING",
  "RETRIEVAL",
  "EVAL",
  "SYSTEMS",
];

export const FIELD_NODES: FieldNode[] = [
  ...scratchIndex.map((e) => ({
    id: e.repo,
    label: e.name,
    sub: `${e.layer} · ${e.lang}`,
    url: `https://github.com/${e.repo}`,
    cluster: layers.indexOf(e.layer),
  })),
  ...caseStudies.map((c) => ({
    id: c.id,
    label: c.title,
    sub: c.domain,
    url: c.links[0]?.href ?? "https://github.com/sdivyanshu90",
    cluster: 5,
  })),
];

/** Map a run's artifact specs to the stars that should converge. */
export function nodesForSpecs(specs: ArtifactSpec[]): string[] {
  const ids = new Set<string>();
  for (const s of specs) {
    if (s.kind === "index") {
      for (const e of scratchIndex) {
        if (!s.params?.layer || e.layer === s.params.layer) ids.add(e.repo);
      }
    } else if (s.kind === "projects") {
      for (const c of caseStudies) {
        if (!s.params?.ids || s.params.ids.includes(c.id)) ids.add(c.id);
      }
    } else if (s.kind === "shipped") {
      // Light the case-study stars — the shipped ledger draws on applied work.
      for (const c of caseStudies) ids.add(c.id);
    } else if (s.kind === "about" || s.kind === "system") {
      for (const n of FIELD_NODES) ids.add(n.id);
    }
  }
  return [...ids];
}

/** Live matching while the visitor types — the relevant stars stir. */
export function nodesForDraft(q: string): string[] {
  if (q.trim().length < 3) return [];
  const ids = new Set<string>();
  for (const [re, id] of PROJECT_HINTS) if (re.test(q)) ids.add(id);
  for (const [re, layer] of LAYER_HINTS) {
    if (re.test(q)) for (const e of scratchIndex) if (e.layer === layer) ids.add(e.repo);
  }
  if (/from.?scratch|build.?your.?own/i.test(q)) for (const e of scratchIndex) ids.add(e.repo);
  return [...ids];
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

interface Star {
  node: FieldNode;
  cx0: number; // cluster center (stage fraction)
  cy0: number;
  orbitR: number; // orbital radius (fraction of min(w,h))
  orbitA: number; // initial orbital angle
  orbitSpeed: number; // radians/sec (signed → direction)
  mag: number; // brightness 0..1 — bright stars get diffraction spikes
  phase: number;
  birth: number; // ignition order, ms offset
  x: number;
  y: number;
}

const CENTER: [number, number] = [0.5, 0.44];
const EASE = (p: number) => 1 - Math.pow(1 - p, 3);
/** Canvas throws on negative radii — clamp every arc. */
const rad = (r: number) => (Number.isFinite(r) && r > 0 ? r : 0.1);

export function Field({
  draftIds,
  activeIds,
  scanKey,
  convergeKey,
  dismissKey,
  burstKey,
  wardKey,
}: {
  draftIds: string[];
  activeIds: string[];
  scanKey: number;
  convergeKey: number;
  dismissKey: number;
  burstKey: number;
  wardKey: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Desktop hover tooltip (transient) vs. touch popover (pinned, interactive).
  const [hover, setHover] = useState<{ star: Star; px: number; py: number } | null>(null);
  const [pinned, setPinned] = useState<{ star: Star; px: number; py: number } | null>(null);
  const reduce = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const stars = useMemo<Star[]>(() => {
    const byCluster = new Map<number, FieldNode[]>();
    for (const n of FIELD_NODES) {
      byCluster.set(n.cluster, [...(byCluster.get(n.cluster) ?? []), n]);
    }
    const out: Star[] = [];
    for (const [cluster, nodes] of byCluster) {
      const [cx, cy] = CLUSTER_POS[cluster];
      nodes.forEach((node, i) => {
        const h = hash(node.id);
        const h2 = hash(node.id + "orbit");
        const angle = (i / nodes.length) * Math.PI * 2 + h * 1.2;
        const orbitR = 0.04 + h * 0.07;
        out.push({
          node,
          cx0: cx,
          cy0: cy,
          orbitR,
          orbitA: angle,
          // Slow, varied orbits; alternate direction for a living system.
          orbitSpeed: (0.02 + h2 * 0.05) * (i % 2 === 0 ? 1 : -1),
          mag: h2, // ~1/6 of stars are "bright" and get diffraction spikes
          phase: h * Math.PI * 2,
          birth: cluster * 160 + i * 45 + h * 40,
          x: 0,
          y: 0,
        });
      });
    }
    return out;
  }, []);

  const state = useRef({
    draftSet: new Set<string>(),
    activeSet: new Set<string>(),
    scanKey,
    scanAt: 0,
    convergeKey,
    convergeAt: 0,
    dismissKey,
    dismissAt: 0,
    burstKey,
    burstAt: 0,
    wardKey,
    wardAt: 0,
    lastTouch: 0,
    hover: null as Star | null,
    pointer: { x: 0.5, y: 0.5, has: false },
  });
  state.current.draftSet = useMemo(() => new Set(draftIds), [draftIds]);
  state.current.activeSet = useMemo(() => new Set(activeIds), [activeIds]);
  if (state.current.scanKey !== scanKey) {
    state.current.scanKey = scanKey;
    state.current.scanAt = performance.now();
  }
  if (state.current.convergeKey !== convergeKey) {
    state.current.convergeKey = convergeKey;
    state.current.convergeAt = performance.now();
  }
  if (state.current.dismissKey !== dismissKey) {
    state.current.dismissKey = dismissKey;
    state.current.dismissAt = performance.now();
  }
  if (state.current.burstKey !== burstKey) {
    state.current.burstKey = burstKey;
    state.current.burstAt = performance.now();
  }
  if (state.current.wardKey !== wardKey) {
    state.current.wardKey = wardKey;
    state.current.wardAt = performance.now();
  }
  state.current.lastTouch = Math.max(
    state.current.lastTouch,
    state.current.scanAt,
    state.current.convergeAt,
    state.current.dismissAt,
    state.current.burstAt,
    state.current.wardAt,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mounted = performance.now();
    // Meteors: occasional sporadics, plus periodic showers that radiate a
    // staggered burst from a single point (like a real meteor shower).
    interface Meteor {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      at: number; // spawn time (may be in the future, for stagger)
      dur: number;
      w: number;
      accent: boolean; // an occasional ember-tinted streak
    }
    let meteors: Meteor[] = [];
    let nextSporadic = mounted + 3000 + Math.random() * 3000;
    let nextShower = mounted + 6000 + Math.random() * 4000;
    // Cursor stardust: motes sprinkled as the pointer moves, drifting down.
    interface Mote {
      x: number;
      y: number;
      vx: number;
      vy: number;
      born: number;
      accent: boolean;
    }
    let motes: Mote[] = [];
    let lastMoteAt = 0;
    const parallax = { x: 0, y: 0 };

    const colors = { faint: "#6e685d", rule: "#ddd5c6", accent: "#a82f1b", ink: "#1c1a17" };
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors.faint = cs.getPropertyValue("--ink-faint").trim() || colors.faint;
      colors.rule = cs.getPropertyValue("--rule").trim() || colors.rule;
      colors.accent = cs.getPropertyValue("--accent").trim() || colors.accent;
      colors.ink = cs.getPropertyValue("--ink").trim() || colors.ink;
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(performance.now());
    });
    ro.observe(wrap);
    resize();

    const clusterOf = new Map<number, Star[]>();
    for (const s of stars) {
      clusterOf.set(s.node.cluster, [...(clusterOf.get(s.node.cluster) ?? []), s]);
    }

    let dream: { cluster: number; at: number } | null = null;
    let dreamNext = mounted + 20_000;

    /** Is any bounded effect alive? Then we render at 60fps, else 30. */
    const effectActive = (now: number) => {
      const st = state.current;
      return (
        now - mounted < 2600 || // ignition
        (st.scanAt && now - st.scanAt < 1000) ||
        (st.convergeAt && now - st.convergeAt < 1600) ||
        (st.dismissAt && now - st.dismissAt < 900) ||
        (st.burstAt && now - st.burstAt < 1300) ||
        (st.wardAt && now - st.wardAt < 1200) ||
        meteors.length > 0 ||
        motes.length > 0 ||
        st.pointer.has ||
        st.draftSet.size > 0
      );
    };

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      const st = state.current;
      const { draftSet, activeSet } = st;
      const cx = CENTER[0] * w;
      const cy = CENTER[1] * h;
      const age = now - mounted;

      // Parallax eases toward the pointer.
      if (!reduce) {
        const tx = st.pointer.has ? (st.pointer.x - 0.5) * -14 : 0;
        const ty = st.pointer.has ? (st.pointer.y - 0.5) * -10 : 0;
        parallax.x += (tx - parallax.x) * 0.04;
        parallax.y += (ty - parallax.y) * 0.04;
      }

      // Position pass: each star orbits its cluster centre (an orrery),
      // with slow cluster breathing and pointer parallax on top.
      const drift = reduce ? 0 : 1;
      const minWH = Math.min(w, h);
      // Depth parallax: nearer (brighter) stars lean a touch more.
      for (const s of stars) {
        const breathe = reduce ? 0 : Math.sin(t * 0.12 + s.node.cluster) * 3;
        const a = s.orbitA + t * s.orbitSpeed * drift;
        const ox = Math.cos(a) * s.orbitR * minWH;
        const oy = Math.sin(a) * s.orbitR * minWH * 0.82; // slight elliptical tilt
        const depth = 0.7 + s.mag * 0.6;
        s.x = s.cx0 * w + ox + parallax.x * depth + breathe;
        s.y = s.cy0 * h + oy + parallax.y * depth - breathe;
      }

      // ── Celestial backdrop: nebula washes, orbital rings, chart labels ──
      const reveal = reduce ? 1 : Math.min(1, age / 2600);
      for (const cluster of clusterOf.keys()) {
        const gx = CLUSTER_POS[cluster][0] * w + parallax.x * 0.5;
        const gy = CLUSTER_POS[cluster][1] * h + parallax.y * 0.5;
        const spread = 0.13 * minWH;

        // Nebula: a soft radial wash breathing behind the cluster.
        const pulse = reduce ? 1 : 0.85 + Math.sin(t * 0.3 + cluster) * 0.15;
        const neb = ctx.createRadialGradient(gx, gy, 0, gx, gy, spread * 1.6 * pulse);
        neb.addColorStop(0, colors.accent);
        neb.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.05 * reveal;
        ctx.fillStyle = neb;
        ctx.beginPath();
        ctx.arc(gx, gy, rad(spread * 1.6 * pulse), 0, Math.PI * 2);
        ctx.fill();

        // Dotted orbital rings (dashed circles the stars ride).
        ctx.setLineDash([1, 5]);
        ctx.strokeStyle = colors.faint;
        for (const rr of [0.055, 0.09, 0.12]) {
          ctx.globalAlpha = 0.18 * reveal;
          ctx.beginPath();
          ctx.arc(gx, gy, rad(rr * minWH), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Engraved region label.
        ctx.globalAlpha = 0.5 * reveal;
        ctx.fillStyle = colors.faint;
        ctx.font = "9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(CLUSTER_LABELS[cluster], gx, gy - spread - 6);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";

      // Constellation web.
      ctx.lineWidth = 1;
      for (const group of clusterOf.values()) {
        if (group.length < 2) continue;
        ctx.strokeStyle = colors.rule;
        for (let i = 0; i < group.length; i++) {
          const a = group[i];
          const b = group[(i + 1) % group.length];
          const born = reduce || age > Math.max(a.birth, b.birth) + 500;
          if (!born) continue;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Typing threads: stirred stars are sewn together with accent thread.
      if (!reduce && draftSet.size > 1) {
        const stirred = stars.filter((s) => draftSet.has(s.node.id));
        ctx.strokeStyle = colors.accent;
        ctx.globalAlpha = 0.16 + Math.sin(t * 2.4) * 0.06;
        ctx.beginPath();
        for (let i = 0; i < stirred.length; i++) {
          const a = stirred[i];
          if (i === 0) ctx.moveTo(a.x, a.y);
          else ctx.lineTo(a.x, a.y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Astrolabe scan: a ring sweeps outward; stars flare as it passes.
      let scanR = -1;
      if (!reduce && st.scanAt && now - st.scanAt < 1000) {
        const p = (now - st.scanAt) / 1000;
        scanR = EASE(p) * Math.hypot(w, h) * 0.62;
        ctx.strokeStyle = colors.accent;
        ctx.globalAlpha = 0.28 * (1 - p);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, rad(scanR), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.1 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, rad(scanR * 0.92), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
      }

      // Ink comets: cited stars fly to the card, trailing.
      const elapsed = st.convergeAt ? now - st.convergeAt : Infinity;
      if (!reduce && elapsed < 1600 && activeSet.size) {
        let i = 0;
        for (const s of stars) {
          if (!activeSet.has(s.node.id)) continue;
          const delay = (i % 14) * 40;
          const p = Math.min(1, Math.max(0, (elapsed - delay) / 700));
          if (p > 0 && p < 1) {
            const ease = EASE(p);
            const mx = (s.x + cx) / 2 + (s.y - cy) * 0.14;
            const my = (s.y + cy) / 2 - (s.x - cx) * 0.14;
            // comet head along quadratic bezier
            const qx = (a: number, b: number, c: number, tt: number) =>
              (1 - tt) * (1 - tt) * a + 2 * (1 - tt) * tt * b + tt * tt * c;
            const hx = qx(s.x, mx, cx, ease);
            const hy = qx(s.y, my, cy, ease);
            // trail
            ctx.strokeStyle = colors.accent;
            for (let k = 1; k <= 4; k++) {
              const tp = Math.max(0, ease - k * 0.07);
              ctx.globalAlpha = 0.3 - k * 0.06;
              ctx.beginPath();
              ctx.moveTo(qx(s.x, mx, cx, tp), qx(s.y, my, cy, tp));
              ctx.lineTo(hx, hy);
              ctx.stroke();
            }
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = colors.accent;
            ctx.beginPath();
            ctx.arc(hx, hy, rad(2.4), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          i++;
        }
        // Impact ripple once the first comets land.
        if (elapsed > 650 && elapsed < 1500) {
          const rp = (elapsed - 650) / 850;
          ctx.strokeStyle = colors.accent;
          ctx.globalAlpha = 0.25 * (1 - rp);
          ctx.beginPath();
          ctx.arc(cx, cy, rad(24 + EASE(rp) * 90), 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Ward: a quarantined query seals the card behind a contracting ring.
      if (!reduce && st.wardAt && now - st.wardAt < 1200) {
        const p = (now - st.wardAt) / 1200;
        // The sky holds its breath…
        ctx.fillStyle = colors.ink;
        ctx.globalAlpha = 0.05 * Math.sin(p * Math.PI);
        ctx.fillRect(0, 0, w, h);
        // …while the seal closes.
        const ringR = Math.hypot(w, h) * 0.55 * (1 - EASE(p)) + 60;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 * Math.sin(Math.min(1, p * 1.4) * Math.PI);
        ctx.beginPath();
        ctx.arc(cx, cy, rad(ringR), 0, Math.PI * 2);
        ctx.stroke();
        // Rune ticks around the seal.
        ctx.globalAlpha *= 0.9;
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2 + p * 1.2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * (ringR + 4), cy + Math.sin(a) * (ringR + 4));
          ctx.lineTo(cx + Math.cos(a) * (ringR + 12), cy + Math.sin(a) * (ringR + 12));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
      }

      // Dream: left alone, the sky quietly re-draws one constellation.
      if (!reduce && now - st.lastTouch > 15_000 && now - mounted > 15_000) {
        if (!dream && now > dreamNext) {
          dream = { cluster: Math.floor((now / 1000) % 6), at: now };
        }
        if (dream) {
          const dp = (now - dream.at) / 4200;
          if (dp >= 1) {
            dream = null;
            dreamNext = now + 12_000;
          } else {
            const group = clusterOf.get(dream.cluster) ?? [];
            const drawUpTo = EASE(Math.min(1, dp * 1.6)) * group.length;
            const fade = dp > 0.7 ? 1 - (dp - 0.7) / 0.3 : 1;
            ctx.strokeStyle = colors.accent;
            ctx.globalAlpha = 0.22 * fade;
            ctx.beginPath();
            for (let k = 0; k < Math.floor(drawUpTo); k++) {
              const s = group[k];
              if (k === 0) ctx.moveTo(s.x, s.y);
              else ctx.lineTo(s.x, s.y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      } else {
        dream = null;
      }

      // Dismiss sparks: the answer scatters back into the sky.
      if (!reduce && st.dismissAt && now - st.dismissAt < 900) {
        const p = (now - st.dismissAt) / 900;
        ctx.fillStyle = colors.accent;
        for (let k = 0; k < 14; k++) {
          const hk = hash(`spark-${st.dismissKey}-${k}`);
          const ang = hk * Math.PI * 2;
          const dist = EASE(p) * (90 + hk * 160);
          ctx.globalAlpha = 0.7 * (1 - p);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist * 0.7, rad(1.6), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // sudo hire: a small celebratory starburst.
      if (!reduce && st.burstAt && now - st.burstAt < 1300) {
        const p = (now - st.burstAt) / 1300;
        for (let k = 0; k < 36; k++) {
          const hk = hash(`burst-${st.burstKey}-${k}`);
          const ang = (k / 36) * Math.PI * 2 + hk;
          const dist = EASE(p) * (60 + hk * 220);
          const gravity = p * p * 60;
          ctx.fillStyle = k % 3 === 0 ? colors.ink : colors.accent;
          ctx.globalAlpha = Math.max(0, 0.9 - p);
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(ang) * dist,
            cy - 40 + Math.sin(ang) * dist * 0.8 + gravity,
            k % 4 === 0 ? 2.4 : 1.6,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Meteors — sporadic singles + periodic showers radiating from a point.
      if (!reduce) {
        const emit = (
          at: number,
          x0: number,
          y0: number,
          angle: number,
          len: number,
          dur: number,
          width: number,
          accent: boolean,
        ) => {
          meteors.push({
            x0,
            y0,
            x1: x0 + Math.cos(angle) * len,
            y1: y0 + Math.sin(angle) * len,
            at,
            dur,
            w: width,
            accent,
          });
        };

        // Lone shooting stars, frequently — a constant light drizzle.
        if (now > nextSporadic && meteors.length < 60) {
          const fromLeft = Math.random() > 0.5;
          const ang = fromLeft ? Math.PI * 0.2 : Math.PI * 0.8;
          emit(
            now,
            fromLeft ? -30 : w + 30,
            h * (0.05 + Math.random() * 0.32),
            ang,
            h * (0.5 + Math.random() * 0.45),
            820,
            1 + Math.random() * 0.5,
            Math.random() < 0.15,
          );
          nextSporadic = now + 3500 + Math.random() * 4500;
        }

        // A meteor shower: a dense staggered burst from one radiant point,
        // fanning outward so streaks rain through both margins. Every so
        // often it escalates into a storm (double the meteors).
        if (now > nextShower && meteors.length < 60) {
          const radiantX = w * (0.3 + Math.random() * 0.4);
          const radiantY = -h * 0.04;
          const storm = Math.random() < 0.3;
          const count = (storm ? 30 : 16) + Math.floor(Math.random() * 8);
          for (let i = 0; i < count; i++) {
            const angle = Math.PI * 0.22 + Math.random() * Math.PI * 0.56; // ~40°→140°
            emit(
              now + i * (storm ? 70 : 110) + Math.random() * 60, // stagger
              radiantX + (Math.random() - 0.5) * w * 0.14,
              radiantY - Math.random() * h * 0.05,
              angle,
              h * (0.72 + Math.random() * 0.55),
              720 + Math.random() * 320,
              1 + Math.random() * 1.3,
              i % 4 === 0, // ~1 in 4 is an ember streak
            );
          }
          nextShower = now + (storm ? 20000 : 12000) + Math.random() * 12000;
        }

        // Draw + cull.
        meteors = meteors.filter((m) => now - m.at < m.dur);
        for (const m of meteors) {
          const p = (now - m.at) / m.dur;
          if (p < 0 || p > 1) continue; // not yet started / finished
          const ease = EASE(p);
          const hx = m.x0 + (m.x1 - m.x0) * ease;
          const hy = m.y0 + (m.y1 - m.y0) * ease;
          const tailP = Math.max(0, ease - 0.14);
          const tx = m.x0 + (m.x1 - m.x0) * tailP;
          const ty = m.y0 + (m.y1 - m.y0) * tailP;
          const col = m.accent ? colors.accent : colors.faint;
          const grad = ctx.createLinearGradient(tx, ty, hx, hy);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(1, col);
          ctx.strokeStyle = grad;
          ctx.globalAlpha = 0.95 * Math.sin(Math.min(1, p) * Math.PI); // fade in & out
          ctx.lineWidth = m.w;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx, hy);
          ctx.stroke();
          // Bright head.
          ctx.fillStyle = col;
          ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 1.5);
          ctx.beginPath();
          ctx.arc(hx, hy, rad(m.w * 0.9), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
      }

      // ── Cursor: stardust trail + a telescope reticle (desktop only) ──
      if (!reduce) {
        // Stardust motes drift down and fade, like the cursor sprinkles them.
        motes = motes.filter((m) => now - m.born < 1100);
        for (const m of motes) {
          const mp = (now - m.born) / 1100;
          m.x += m.vx;
          m.y += m.vy;
          m.vy += 0.03; // gentle gravity
          ctx.fillStyle = m.accent ? colors.accent : colors.faint;
          ctx.globalAlpha = 0.6 * (1 - mp);
          ctx.beginPath();
          ctx.arc(m.x, m.y, rad((1 - mp) * 1.6 + 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // The reticle: a telescope sight that tracks the pointer and locks
        // onto a star when hovering one.
        if (st.pointer.has) {
          const px = st.pointer.x * w;
          const py = st.pointer.y * h;
          const locked = st.hover !== null;
          const ring = locked ? 8 : 15 + Math.sin(t * 3) * 1.5;
          ctx.strokeStyle = locked ? colors.accent : colors.faint;
          ctx.globalAlpha = locked ? 0.7 : 0.4;
          ctx.lineWidth = 1;
          // Rotating broken ring.
          const rot = t * (locked ? -1.6 : 0.6);
          for (let k = 0; k < 4; k++) {
            const a0 = rot + (k * Math.PI) / 2 + 0.25;
            ctx.beginPath();
            ctx.arc(px, py, rad(ring), a0, a0 + Math.PI / 2 - 0.5);
            ctx.stroke();
          }
          // Crosshair ticks.
          ctx.globalAlpha = locked ? 0.5 : 0.28;
          const tick = ring + 5;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
            ctx.beginPath();
            ctx.moveTo(px + dx * (ring + 1), py + dy * (ring + 1));
            ctx.lineTo(px + dx * tick, py + dy * tick);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }

      // Satellite: a slow blip tracks a straight low pass, blinking, once a
      // minute — the observatory's own instrument crossing the field.
      if (!reduce) {
        const period = 60_000;
        const cycle = (now - mounted) % period;
        const pass = 14_000;
        if (cycle < pass) {
          const sp = cycle / pass;
          const sxp = sp * (w + 80) - 40;
          const syp = h * (0.16 + Math.sin(sp * Math.PI) * 0.05);
          ctx.fillStyle = colors.faint;
          ctx.globalAlpha = 0.55 * Math.sin(sp * Math.PI); // fade in/out at edges
          ctx.beginPath();
          ctx.arc(sxp, syp, rad(1.6), 0, Math.PI * 2);
          ctx.fill();
          // Blink beacon.
          if (Math.sin(now / 180) > 0.6) {
            ctx.fillStyle = colors.accent;
            ctx.globalAlpha *= 1.4;
            ctx.beginPath();
            ctx.arc(sxp, syp, rad(1), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }

      // Stars.
      for (const s of stars) {
        // Ignition: each star is born in sequence.
        let birthScale = 1;
        if (!reduce && age < s.birth + 500) {
          if (age < s.birth) continue;
          const bp = (age - s.birth) / 500;
          birthScale = 0.3 + EASE(bp) * 0.7 + Math.sin(bp * Math.PI) * 0.9;
        }
        const active = activeSet.has(s.node.id);
        const drafted = draftSet.has(s.node.id);
        const hovered = st.hover === s;
        // Scan flare: the wavefront brushing past a star lights it briefly.
        const flare = scanR > 0 && Math.abs(Math.hypot(s.x - cx, s.y - cy) - scanR) < 26;
        // Twinkle: hash-scheduled shimmer.
        const twinkle = reduce ? 0 : Math.max(0, Math.sin(t * 0.9 + s.phase * 7)) ** 8 * 0.3;
        const bright = s.mag > 0.82;
        const r = (hovered ? 5 : active ? 3.6 : drafted ? 3.2 : flare ? 3.4 : bright ? 2.7 : 2.2) * birthScale;
        const lit = active || hovered || drafted || flare;

        // Diffraction spikes on the brightest stars (and any lit star).
        if (!reduce && (bright || lit)) {
          const spike = (lit ? 9 : 5 + twinkle * 14) * birthScale;
          ctx.strokeStyle = lit ? colors.accent : colors.faint;
          ctx.globalAlpha = (lit ? 0.55 : 0.3) + twinkle * 0.4;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(s.x - spike, s.y);
          ctx.lineTo(s.x + spike, s.y);
          ctx.moveTo(s.x, s.y - spike);
          ctx.lineTo(s.x, s.y + spike);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, rad(r), 0, Math.PI * 2);
        ctx.fillStyle = lit ? colors.accent : colors.faint;
        ctx.globalAlpha = (active || hovered ? 1 : drafted || flare ? 0.9 : 0.7) + twinkle * 0.3;
        ctx.fill();
        if (drafted && !reduce) {
          const pulse = 4 + Math.sin(t * 3 + s.phase) * 1.5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, rad(r + pulse), 0, Math.PI * 2);
          ctx.strokeStyle = colors.accent;
          ctx.globalAlpha = 0.25;
          ctx.stroke();
        }
        if (hovered && !reduce) {
          // Orbit ring around the hovered star.
          ctx.strokeStyle = colors.accent;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 10, t * 2.2, t * 2.2 + Math.PI * 1.4);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    let running = true;
    let last = 0;
    const loop = (now: number) => {
      if (!running) return;
      const interval = effectActive(now) ? 16 : 33;
      if (now - last >= interval) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce && running) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) {
      draw(performance.now());
      const iv = setInterval(() => draw(performance.now()), 400);
      return () => {
        clearInterval(iv);
        ro.disconnect();
        themeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
      };
    }
    // One static frame immediately; the loop starts after hydration settles.
    draw(performance.now());
    const startTimer = setTimeout(() => {
      raf = requestAnimationFrame(loop);
    }, 900);

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const nearestStar = (px: number, py: number, radius: number): Star | null => {
      let best: Star | null = null;
      let bestD = radius;
      for (const s of stars) {
        const d = Math.hypot(s.x - px, s.y - py);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      }
      return best;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // touch is handled by onClick
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      state.current.pointer = { x: px / Math.max(1, w), y: py / Math.max(1, h), has: true };
      state.current.lastTouch = performance.now();

      // Sprinkle stardust as the cursor moves (throttled + capped).
      const nowP = performance.now();
      if (nowP - lastMoteAt > 26 && motes.length < 46) {
        lastMoteAt = nowP;
        motes.push({
          x: px + (Math.random() - 0.5) * 4,
          y: py + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.7,
          vy: 0.15 + Math.random() * 0.4,
          born: nowP,
          accent: Math.random() < 0.22,
        });
      }

      const best = nearestStar(px, py, 20);
      state.current.hover = best;
      canvas.style.cursor = "none"; // the reticle is the cursor over the sky
      setHover(best ? { star: best, px: best.x, py: best.y } : null);
    };

    const onLeave = () => {
      state.current.hover = null;
      state.current.pointer.has = false;
      setHover(null);
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const best = nearestStar(px, py, coarsePointer ? 28 : 20);
      if (coarsePointer) {
        // Touch: reveal an interactive popover (its link opens the repo);
        // tapping empty sky dismisses it. No moving-target second tap.
        state.current.lastTouch = performance.now();
        state.current.hover = best;
        setPinned(
          best
            ? {
                star: best,
                px: Math.max(96, Math.min(w - 96, best.x)),
                py: Math.min(best.y, h - 110),
              }
            : null,
        );
      } else if (best) {
        window.open(best.node.url, "_blank", "noopener,noreferrer");
      }
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    return () => {
      running = false;
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [stars, reduce]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />

      {/* The crawlable/SR equivalent lives in <StarIndex/> (server-rendered). */}

      {/* Desktop: transient hover tooltip (the star's repo opens on click). */}
      {hover && !pinned ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 max-w-[240px] -translate-x-1/2 border border-rule bg-surface px-2.5 py-1.5 shadow-sm"
          style={{ left: hover.px, top: hover.py + 14 }}
        >
          <p className="font-mono text-[11px] leading-snug text-ink">{hover.star.node.label}</p>
          <p className="font-mono text-[10px] leading-snug text-ink-faint">
            {hover.star.node.sub} · click to open
          </p>
        </div>
      ) : null}

      {/* Touch: pinned, interactive popover — tap its link to open the repo,
          tap empty sky to dismiss. No fragile second tap on a moving star. */}
      {pinned ? (
        <div
          className="pointer-events-none absolute z-20 w-[200px] -translate-x-1/2 border border-accent bg-surface px-3 py-2 shadow-md"
          style={{ left: pinned.px, top: pinned.py + 16 }}
        >
          <p className="font-mono text-[11px] leading-snug text-ink">
            {pinned.star.node.label}
          </p>
          <p className="mt-0.5 font-mono text-[10px] leading-snug text-ink-faint">
            {pinned.star.node.sub}
          </p>
          <a
            href={pinned.star.node.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setPinned(null)}
            className="pointer-events-auto mt-2 inline-block border border-accent px-2.5 py-1 font-mono text-[11px] tracking-wide text-accent uppercase transition-colors hover:bg-accent hover:text-paper"
          >
            open repo ↗
          </a>
        </div>
      ) : null}
    </div>
  );
}
