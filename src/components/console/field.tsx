"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import activity from "@/data/activity.json";
import { FIELD_NODES, type FieldNode } from "@/components/console/field-nodes";
import { beacon } from "@/lib/beacon";

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

// Cluster anchors (stage fractions), keeping the center clear for the card.
const CLUSTER_POS: [number, number][] = [
  [0.14, 0.3], // Modeling & training
  [0.12, 0.74], // Alignment & fine-tuning
  [0.87, 0.28], // Inference & serving
  [0.88, 0.72], // Retrieval & data
  [0.3, 0.1], // Evaluation & safety
  [0.62, 0.09], // Case studies
  [0.07, 0.52], // Upstream open source
];

// Engraved chart labels, one per cluster — the atlas names its regions.
const CLUSTER_LABELS = [
  "MODELING",
  "ALIGNMENT",
  "SERVING",
  "RETRIEVAL",
  "EVAL",
  "SYSTEMS",
  "UPSTREAM",
];


/* ── Living sky: real GitHub dates and activity (src/data/activity.json) ── */

const ACT = activity.stars as Record<string, { created: string; pushed: string; stars: number }>;
const DAY = 86_400_000;
const bornOf = (id: string) => (ACT[id] ? Date.parse(ACT[id].created) : 0);
const TL_START = Math.min(...Object.values(ACT).map((a) => Date.parse(a.created)));
/** Time-lapse length: the whole history replays in this many ms. */
const TL_MS = 9_000;
const ago = (d: string) => {
  const days = Math.max(0, Math.floor((Date.now() - Date.parse(d)) / DAY));
  return days === 0 ? "today" : days < 30 ? `${days}d ago` : days < 365 ? `${Math.floor(days / 30)}mo ago` : `${Math.floor(days / 365)}y ago`;
};
/** Pushed within two weeks: the star twinkles harder. */
const isFresh = (id: string) => !!ACT[id] && Date.now() - Date.parse(ACT[id].pushed) < 14 * DAY;

/** Extra tooltip line: activity, stars, and how often visitors ask. */
function starMeta(id: string, demand: Record<string, number>): string {
  const a = ACT[id];
  const parts = [
    a && !id.startsWith("oss:") && a.pushed !== a.created.slice(0, 4) + "-01-01" ? `pushed ${ago(a.pushed)}` : null,
    a && id.startsWith("oss:") ? `since ${a.created.slice(0, 7)}` : null,
    a?.stars ? `${a.stars}★` : null,
    demand[id] ? `asked ${demand[id]}× lately` : null,
  ];
  return parts.filter(Boolean).join(" · ");
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
  draft,
  activeIds,
  scanKey,
  convergeKey,
  dismissKey,
  burstKey,
  wardKey,
  showTimelapse,
}: {
  draft: Map<string, number>;
  activeIds: string[];
  scanKey: number;
  convergeKey: number;
  dismissKey: number;
  burstKey: number;
  wardKey: number;
  /** Phones: the time-lapse control only shows while peeking at the sky. */
  showTimelapse?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  /** Set by the render loop; restarts a sleeping sky. */
  const wakeRef = useRef<() => void>(() => {});
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
    draftSet: new Map<string, number>(),
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
    /** Visitor demand per star (from /api/demand). */
    demand: {} as Record<string, number>,
    /** Time-lapse playback start (performance.now()), or null. */
    tlAt: null as number | null,
  });
  const [demand, setDemand] = useState<Record<string, number>>({});
  const [tlPlaying, setTlPlaying] = useState(false);
  const tlLabel = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    fetch("/api/demand")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: Record<string, number>) => {
        state.current.demand = d;
        setDemand(d);
      })
      .catch(() => {});
  }, []);
  state.current.draftSet = draft;
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

  // Keyboard exploration: arrow keys walk the sky (← → within a cluster,
  // ↑ ↓ across clusters), Enter opens the star's repo. Sighted keyboard
  // users get the chart too, not just the screen-reader list.
  const order = useMemo(
    () => [...stars].sort((a, b) => a.node.cluster - b.node.cluster || a.orbitA - b.orbitA),
    [stars],
  );
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const focusStar = (i: number) => {
    const s = order[(i + order.length) % order.length];
    const idx = order.indexOf(s);
    setFocusIdx(idx);
    state.current.hover = s;
    state.current.lastTouch = performance.now();
    setHover({ star: s, px: s.x, py: s.y });
    wakeRef.current();
  };
  const onSkyKey = (e: React.KeyboardEvent) => {
    const i = focusIdx ?? -1;
    const cluster = i >= 0 ? order[i].node.cluster : -1;
    const firstIn = (c: number) => order.findIndex((s) => s.node.cluster === c);
    const clusters = [...new Set(order.map((s) => s.node.cluster))];
    if (e.key === "ArrowRight") focusStar(i + 1);
    else if (e.key === "ArrowLeft") focusStar(i <= 0 ? order.length - 1 : i - 1);
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const at = clusters.indexOf(cluster);
      const next = clusters[(at + (e.key === "ArrowDown" ? 1 : -1) + clusters.length) % clusters.length];
      focusStar(firstIn(next));
    } else if (e.key === "Enter" && i >= 0) {
      window.open(order[i].node.url, "_blank", "noopener,noreferrer");
    } else if (e.key === "Escape") {
      (e.currentTarget as HTMLElement).blur();
    } else return;
    e.preventDefault();
  };
  const leaveSky = () => {
    setFocusIdx(null);
    state.current.hover = null;
    setHover(null);
  };

  // Any console event (run, answer, dismiss, ward) wakes a sleeping sky.
  useEffect(() => {
    wakeRef.current();
  }, [draft, activeIds, scanKey, convergeKey, dismissKey, burstKey, wardKey]);

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
    // First visit gets the full show; returning visitors (remembered after
    // 20s) get a quieter sky — a third of the meteors, and no storms.
    const seen = (() => {
      try {
        return localStorage.getItem("div1-sky-seen") === "1";
      } catch {
        return false;
      }
    })();
    const calm = seen ? 3 : 1;
    const markSeen = setTimeout(() => {
      try {
        localStorage.setItem("div1-sky-seen", "1");
      } catch {
        /* private mode — keep the full show */
      }
    }, 20_000);
    let nextSporadic = mounted + (3000 + Math.random() * 3000) * calm;
    let nextShower = mounted + (6000 + Math.random() * 4000) * calm;
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

    // Idle budget: a sky nobody is looking at shouldn't cost a laptop its
    // battery. Past DROWSY the frame rate drops; past SLEEP no new meteors
    // spawn, and once the last effect settles the loop stops entirely until
    // the visitor moves, types, scrolls, or focuses something.
    const DROWSY_MS = 12_000;
    const SLEEP_MS = 45_000;
    let lastActivity = mounted;
    let sleeping = false;
    const idleFor = (now: number) => now - Math.max(lastActivity, state.current.lastTouch);

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
        // A resting cursor only needs frames while parallax settles.
        (st.pointer.has && now - st.lastTouch < 2000) ||
        st.tlAt !== null
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
      // Time-lapse: stars appear on their real creation dates.
      let cursor: number | null = null;
      if (st.tlAt !== null) {
        const p = Math.min(1, (now - st.tlAt) / TL_MS);
        cursor = TL_START + EASE(p) * (Date.now() - TL_START);
        if (tlLabel.current) tlLabel.current.textContent = new Date(cursor).toISOString().slice(0, 7);
        if (p >= 1) {
          st.tlAt = null;
          cursor = null;
          setTlPlaying(false);
        }
      }
      const unborn = (s: Star) => cursor !== null && bornOf(s.node.id) > cursor;

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
          if (!born || unborn(a) || unborn(b)) continue;
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
        // Thread the most relevant stars, strongest first.
        const stirred = stars
          .filter((s) => draftSet.has(s.node.id))
          .sort((a, b) => (draftSet.get(b.node.id) ?? 0) - (draftSet.get(a.node.id) ?? 0))
          .slice(0, 9);
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
          dream = { cluster: Math.floor((now / 1000) % CLUSTER_POS.length), at: now };
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
        if (now > nextSporadic && meteors.length < 60 && idleFor(now) < SLEEP_MS) {
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
          nextSporadic = now + (3500 + Math.random() * 4500) * calm;
        }

        // A meteor shower: a dense staggered burst from one radiant point,
        // fanning outward so streaks rain through both margins. Every so
        // often it escalates into a storm (double the meteors).
        if (now > nextShower && meteors.length < 60 && idleFor(now) < SLEEP_MS) {
          const radiantX = w * (0.3 + Math.random() * 0.4);
          const radiantY = -h * 0.04;
          const storm = !seen && Math.random() < 0.3;
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
          nextShower = now + ((storm ? 20000 : 12000) + Math.random() * 12000) * calm;
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
        if (unborn(s)) continue;
        if (cursor !== null) {
          // Just born in the time-lapse: a brief ignition flare.
          const since = (cursor - bornOf(s.node.id)) / (Date.now() - TL_START);
          if (since < 0.05) birthScale = 1 + (0.05 - since) * 24;
        }
        // Demand: a faint halo that grows with how often visitors ask.
        const asked = st.demand[s.node.id] ?? 0;
        if (asked > 0) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, rad(6 + Math.log2(1 + asked) * 2.4), 0, Math.PI * 2);
          ctx.fillStyle = colors.accent;
          ctx.globalAlpha = Math.min(0.2, 0.06 + asked * 0.012);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        const active = activeSet.has(s.node.id);
        const weight = draftSet.get(s.node.id) ?? 0;
        const drafted = weight > 0;
        const hovered = st.hover === s;
        // Scan flare: the wavefront brushing past a star lights it briefly.
        const flare = scanR > 0 && Math.abs(Math.hypot(s.x - cx, s.y - cy) - scanR) < 26;
        // Twinkle: hash-scheduled shimmer.
        // Living sky: a repo pushed in the last two weeks twinkles harder.
        const twinkle = reduce
          ? 0
          : Math.max(0, Math.sin(t * 0.9 + s.phase * 7)) ** 8 * (isFresh(s.node.id) ? 0.8 : 0.3);
        const bright = s.mag > 0.82;
        const r =
          (hovered ? 5 : active ? 3.6 : drafted ? 2.4 + weight * 1.4 : flare ? 3.4 : bright ? 2.7 : 2.2) *
          birthScale;
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
        ctx.globalAlpha =
          (active || hovered ? 1 : drafted ? 0.6 + weight * 0.35 : flare ? 0.9 : 0.7) + twinkle * 0.3;
        ctx.fill();
        if (drafted && weight > 0.55 && !reduce) {
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
    let cost = 0; // moving-average draw time, ms
    const loop = (now: number) => {
      if (!running) return;
      const active = effectActive(now);
      const idle = idleFor(now);
      if (!active && !dream && idle > SLEEP_MS) {
        draw(now); // settle on a still frame, then stop until woken
        sleeping = true;
        return;
      }
      // Adaptive budget: slow devices get fewer frames; if frames stay very
      // expensive the sky settles to a still chart (redrawn only on events).
      const floor = cost > 24 ? 250 : cost > 10 ? 33 : 16;
      const interval = Math.max(floor, active ? 16 : idle > DROWSY_MS ? 66 : 33);
      if (now - last >= interval) {
        last = now;
        const t0 = performance.now();
        draw(now);
        cost = cost * 0.9 + (performance.now() - t0) * 0.1; // moving average (ms)
      }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      lastActivity = performance.now();
      if (sleeping && running && !reduce && !document.hidden) {
        sleeping = false;
        raf = requestAnimationFrame(loop);
      }
    };
    wakeRef.current = wake;
    const WAKE_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "focusin"] as const;
    for (const ev of WAKE_EVENTS) window.addEventListener(ev, wake, { passive: true });
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce && running) {
        sleeping = false;
        lastActivity = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) {
      draw(performance.now());
      const iv = setInterval(() => draw(performance.now()), 400);
      return () => {
        clearInterval(iv);
        for (const ev of WAKE_EVENTS) window.removeEventListener(ev, wake);
        ro.disconnect();
        themeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
      };
    }
    // One static frame immediately; the animation starts only once the page
    // has loaded and the main thread is idle — it never competes with the
    // content for the first seconds on a slow phone.
    draw(performance.now());
    let idleHandle: number | undefined;
    const begin = () => {
      const start = () => {
        if (running) raf = requestAnimationFrame(loop);
      };
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      idleHandle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 3000 }) : window.setTimeout(start, 1200);
    };
    const startTimer = setTimeout(() => (document.readyState === "complete" ? begin() : window.addEventListener("load", begin, { once: true })), 900);

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
      clearTimeout(markSeen);
      for (const ev of WAKE_EVENTS) window.removeEventListener(ev, wake);
      clearTimeout(startTimer);
      window.removeEventListener("load", begin);
      if (idleHandle !== undefined) {
        const w = window as Window & { cancelIdleCallback?: (h: number) => void };
        if (w.cancelIdleCallback) w.cancelIdleCallback(idleHandle);
        else clearTimeout(idleHandle);
      }
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

      <div
        tabIndex={0}
        role="application"
        aria-roledescription="star chart"
        aria-label={`Constellation of ${order.length} systems. Arrow keys move between stars, up and down change region, Enter opens the repository.`}
        onKeyDown={onSkyKey}
        onFocus={() => {
          if (focusIdx === null) focusStar(0);
          beacon("sky", { via: "keyboard" });
        }}
        onBlur={leaveSky}
        className="sr-only z-30 font-mono text-[11px] focus:not-sr-only focus:absolute focus:bottom-3 focus:left-3 focus:border focus:border-accent focus:bg-surface focus:px-2.5 focus:py-1.5 focus:text-ink-muted"
      >
        explore the sky · ← → ↑ ↓ · enter opens
      </div>
      {!reduce ? (
        <button
          type="button"
          onClick={() => {
            if (tlPlaying) {
              state.current.tlAt = null;
              setTlPlaying(false);
              return;
            }
            state.current.tlAt = performance.now();
            state.current.lastTouch = performance.now();
            setTlPlaying(true);
            wakeRef.current();
            beacon("sky", { via: "timelapse" });
          }}
          aria-label={tlPlaying ? "Stop the time-lapse" : "Replay the sky in the order the work was built"}
          className={`absolute right-3 bottom-3 z-20 border border-rule bg-surface/90 px-2.5 py-1 font-mono text-[11px] tracking-wider text-ink-faint uppercase transition-colors hover:border-accent hover:text-accent sm:block ${
            showTimelapse ? "block" : "hidden"
          }`}
        >
          {tlPlaying ? (
            <>
              ■ <span ref={tlLabel} className="text-accent" />
            </>
          ) : (
            "▶ time-lapse"
          )}
        </button>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {focusIdx !== null ? `${order[focusIdx].node.label} — ${order[focusIdx].node.sub}` : ""}
      </p>

      {/* The crawlable/SR equivalent lives in <StarIndex/> (server-rendered). */}

      {/* Desktop: transient hover tooltip (the star's repo opens on click). */}
      {hover && !pinned ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 max-w-[240px] -translate-x-1/2 border border-rule bg-surface px-2.5 py-1.5 shadow-sm"
          style={{ left: hover.px, top: hover.py + 14 }}
        >
          <p className="font-mono text-[11px] leading-snug text-ink">{hover.star.node.label}</p>
          <p className="font-mono text-[11px] leading-snug text-ink-faint">
            {hover.star.node.sub} · click to open
          </p>
          {starMeta(hover.star.node.id, demand) ? (
            <p className="mt-0.5 font-mono text-[11px] leading-snug text-accent">{starMeta(hover.star.node.id, demand)}</p>
          ) : null}
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
          <p className="mt-0.5 font-mono text-[11px] leading-snug text-ink-faint">
            {pinned.star.node.sub}
          </p>
          {starMeta(pinned.star.node.id, demand) ? (
            <p className="mt-0.5 font-mono text-[11px] leading-snug text-accent">{starMeta(pinned.star.node.id, demand)}</p>
          ) : null}
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
