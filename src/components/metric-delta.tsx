"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

interface ParsedMetric {
  from: number | null;
  to: number;
  suffix: string;
  decimals: number;
  grouped: boolean;
}

function parseMetric(metric: string): ParsedMetric | null {
  const arrow = metric.match(
    /^(\d[\d,]*(?:\.\d+)?)\s*→\s*(\d[\d,]*(?:\.\d+)?)(.*)$/,
  );
  const single = metric.match(/^(\d[\d,]*(?:\.\d+)?)(.*)$/);
  const match = arrow ?? single;
  if (!match) return null;

  const fromText = arrow?.[1] ?? null;
  const toText = arrow?.[2] ?? single?.[1];
  const suffix = arrow?.[3] ?? single?.[2] ?? "";
  if (!toText) return null;

  return {
    from: fromText ? Number(fromText.replaceAll(",", "")) : null,
    to: Number(toText.replaceAll(",", "")),
    suffix,
    decimals: (toText.split(".")[1] ?? "").length,
    grouped: toText.includes(","),
  };
}

function format(value: number, metric: ParsedMetric): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: metric.decimals,
    maximumFractionDigits: metric.decimals,
    useGrouping: metric.grouped,
  });
}

/** A measured-result number that rolls from its baseline when it enters view. */
export function MetricDelta({
  metric,
  animated,
}: {
  metric: string;
  animated?: boolean;
}) {
  const parsed = useMemo(() => parseMetric(metric), [metric]);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-24px" });
  const reduce = useReducedMotion();
  const [text, setText] = useState(metric);

  useEffect(() => {
    if (!animated || !parsed || !inView || reduce) {
      setText(metric);
      return;
    }

    const start = parsed.from ?? 0;
    const prefix =
      parsed.from == null ? "" : `${format(parsed.from, parsed)} → `;
    const started = performance.now();
    const duration = 850;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = start + (parsed.to - start) * eased;
      setText(`${prefix}${format(value, parsed)}${parsed.suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animated, inView, metric, parsed, reduce]);

  if (!animated || !parsed) return <>{metric}</>;

  const hasComparison = parsed.from != null && parsed.to > 0;
  const scaleFrom = hasComparison
    ? Math.max(0, Math.min(1, parsed.from! / parsed.to))
    : 0;

  return (
    <span ref={ref} className="block">
      <span className="sr-only">{metric}</span>
      <span aria-hidden>{text}</span>
      {hasComparison ? (
        <span
          aria-hidden
          className="relative mt-1 block h-0.5 w-full overflow-hidden bg-rule-faint"
        >
          <motion.span
            className="absolute inset-0 origin-left bg-accent"
            initial={false}
            animate={{ scaleX: inView ? 1 : scaleFrom }}
            transition={{
              duration: reduce ? 0 : 0.85,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        </span>
      ) : null}
    </span>
  );
}
