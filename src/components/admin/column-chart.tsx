"use client";

import { useState } from "react";

/**
 * Single-series column chart: thin bars (≤24px) with a 4px rounded data end,
 * square at the baseline; recessive axis; direct labels only on the peak and
 * the latest bar; hover/focus tooltip on the whole column (not just the bar);
 * and a table view, so no value is tooltip-only.
 */

export interface Column {
  key: string;
  label: string; // axis label
  detail: string; // tooltip heading, e.g. "Week of 22 Sep"
  value: number;
}

const H = 150;
const TOP = 18; // room for direct labels
/** Fixed drawing width: few columns stay thin and legible instead of stretching. */
const W = 520;

function barPath(x: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  const y = TOP + (H - h);
  const base = TOP + H;
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${base} Z`;
}

export function ColumnChart({ data, unit, title }: { data: Column[]; unit: string; title: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.findIndex((d) => d.value === Math.max(...data.map((x) => x.value)));
  const last = data.length - 1;
  const width = W;
  const SLOT = W / Math.max(1, data.length);
  const bw = Math.min(24, SLOT - 12);
  const every = data.length > 8 ? 2 : 1;

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${width} ${TOP + H + 22}`} className="w-full overflow-visible" role="img" aria-label={title}>
        <line x1={0} x2={width} y1={TOP + H} y2={TOP + H} className="stroke-rule" strokeWidth={1} />
        {data.map((d, i) => {
          const h = d.value > 0 ? Math.max(2, (d.value / max) * H) : 0;
          const x = i * SLOT + (SLOT - bw) / 2;
          const labelled = d.value > 0 && (i === peak || i === last);
          return (
            <g key={d.key}>
              {h > 0 ? (
                <path d={barPath(x, bw, h)} className="fill-chart" opacity={hover === null || hover === i ? 1 : 0.45} />
              ) : null}
              {labelled ? (
                <text x={x + bw / 2} y={TOP + H - h - 5} textAnchor="middle" className="fill-ink font-mono text-[10px]">
                  {d.value}
                </text>
              ) : null}
              {i % every === 0 || i === last ? (
                <text x={i * SLOT + SLOT / 2} y={TOP + H + 15} textAnchor="middle" className="fill-ink-faint font-mono text-[9px]">
                  {d.label}
                </text>
              ) : null}
              {/* Hit target: the whole column, keyboard-focusable. */}
              <rect
                x={i * SLOT}
                y={0}
                width={SLOT}
                height={TOP + H}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${d.detail}: ${d.value} ${unit}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-default outline-none"
              />
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div
          className={`pointer-events-none absolute top-0 z-10 border border-rule bg-surface px-2.5 py-1.5 whitespace-nowrap shadow-sm ${
            // Anchor inside the plot at the edges so the tooltip never clips.
            hover < data.length * 0.25 ? "" : hover > data.length * 0.75 ? "-translate-x-full" : "-translate-x-1/2"
          }`}
          style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
        >
          <p className="font-mono text-[10px] text-ink-faint">{data[hover].detail}</p>
          <p className="font-mono text-[12px] text-ink">
            {data[hover].value} {unit}
          </p>
        </div>
      ) : null}
      <details className="mt-2">
        <summary className="cursor-pointer font-mono text-[10px] tracking-wider text-ink-faint uppercase hover:text-accent">
          table view
        </summary>
        <table className="report-table mt-2 w-full font-mono text-[11px]">
          <tbody>
            {data.map((d) => (
              <tr key={d.key}>
                <td className="py-1 text-ink-muted">{d.detail}</td>
                <td className="py-1 text-right text-ink tabular-nums">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
