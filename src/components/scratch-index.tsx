"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { layers, scratchIndex, type Layer } from "@/data/portfolio";

type Filter = "All" | Layer;

/**
 * The catalog table of from-scratch implementations — the console's
 * centerpiece artifact. Filterable by stack layer; every row links to
 * its repo.
 */
export function ScratchIndex({ initialLayer }: { initialLayer?: Layer }) {
  const [filter, setFilter] = useState<Filter>(initialLayer ?? "All");
  const reduce = useReducedMotion();

  const rows =
    filter === "All"
      ? scratchIndex
      : scratchIndex.filter((e) => e.layer === filter);

  const chips: Filter[] = ["All", ...layers];

  return (
    <div>
      <div
        role="group"
        aria-label="Filter the index by stack layer"
        className="mb-5 flex flex-wrap gap-2"
      >
        {chips.map((c) => {
          const count =
            c === "All"
              ? scratchIndex.length
              : scratchIndex.filter((e) => e.layer === c).length;
          const active = filter === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={active}
              className={`relative border px-3 py-1.5 font-mono text-[11px] tracking-wide uppercase transition-colors ${
                active
                  ? "border-accent text-paper"
                  : "border-rule text-ink-muted hover:border-accent hover:text-accent"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="index-chip-ink"
                  aria-hidden
                  className="absolute inset-0 bg-accent"
                  transition={{ duration: reduce ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                />
              ) : null}
              <span className="relative">
                {c} <span>{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="report-table w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">
            From-scratch implementations of the modern AI stack, filterable by
            layer
          </caption>
          <thead>
            <tr className="font-mono text-[11px] tracking-[0.15em] text-ink-faint uppercase">
              <th scope="col" className="py-2.5 pr-4 font-medium">
                System
              </th>
              <th scope="col" className="py-2.5 pr-4 font-medium">
                Layer
              </th>
              <th scope="col" className="py-2.5 pr-4 font-medium">
                What it is
              </th>
              <th scope="col" className="py-2.5 pr-4 font-medium">
                Lang
              </th>
              <th scope="col" className="py-2.5 font-medium">
                <span className="sr-only">Repository link</span>
              </th>
            </tr>
          </thead>
          <tbody key={filter}>
            {rows.map((e, i) => (
              <motion.tr
                key={e.repo}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: reduce ? 0 : Math.min(i * 0.022, 0.45) }}
                className="group align-top text-[14px]"
              >
                <th
                  scope="row"
                  className="py-3 pr-4 font-medium whitespace-nowrap text-ink"
                >
                  {e.name}
                  {e.engineered ? (
                    <span
                      title="Engineered library — tests, strict typing, production concerns"
                      className="ml-1.5 font-mono text-[10px] text-accent"
                    >
                      ⚙
                    </span>
                  ) : null}
                </th>
                <td className="py-3 pr-4 font-mono text-[11px] whitespace-nowrap text-ink-faint">
                  {e.layer}
                </td>
                <td className="min-w-[260px] py-3 pr-4 leading-relaxed text-ink-muted">
                  {e.summary}
                </td>
                <td className="py-3 pr-4 font-mono text-[12px] text-ink-faint">
                  {e.lang}
                </td>
                <td className="py-3 text-right">
                  <a
                    href={`https://github.com/${e.repo}`}
                    aria-label={`src: ${e.name} repository on GitHub`}
                    className="font-mono text-[12px] whitespace-nowrap text-ink-muted underline decoration-rule underline-offset-4 transition-colors group-hover:text-accent hover:decoration-accent"
                  >
                    src ↗
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-prose font-mono text-[11px] leading-relaxed text-ink-faint">
        The modern AI stack, rebuilt to understand it — {scratchIndex.length}{" "}
        readable reference implementations.{" "}
        <span className="text-accent">⚙</span> marks the{" "}
        {scratchIndex.filter((e) => e.engineered).length} that are engineered
        libraries (tests, strict typing, production concerns); the rest are
        study builds. Part of 160 public repos — the applied, shipped work is a
        separate query (“show shipped systems”).
      </p>
    </div>
  );
}
