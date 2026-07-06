"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The answer card — the single vessel every response materializes in.
 * With `animated`, the card typesets itself: header stamp → trace thread →
 * narration → artifact wipe → footer, in a cascade. The boot card renders
 * it statically (SSR).
 */

export interface TraceStep {
  step: "intent" | "tool" | "synthesis" | "guardrail";
  detail: string;
}

export function TraceStrip({
  steps,
  running,
}: {
  steps: TraceStep[];
  running?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <ol
      aria-label="Run trace"
      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10px] text-ink-faint sm:text-[11px]"
    >
      {steps.map((s, i) => (
        <motion.li
          key={`${s.step}-${i}`}
          className="whitespace-nowrap"
          initial={reduce ? false : { opacity: 0, x: -8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <span className="text-accent">▸</span> {s.step}: {s.detail}
        </motion.li>
      ))}
      {running ? (
        <li aria-hidden className="animate-pulse text-accent motion-reduce:animate-none">
          ▸ running…
        </li>
      ) : null}
    </ol>
  );
}

function Cascade({
  animated,
  order,
  children,
  className,
}: {
  animated?: boolean;
  order: number;
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (!animated || reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 * order, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Artifacts wipe in like a print roller passing over the page. */
export function ArtifactWipe({
  animated,
  children,
}: {
  animated?: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (!animated || reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
      animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CardShell({
  label,
  question,
  trace,
  running,
  narration,
  note,
  footer,
  actions,
  children,
  animated,
}: {
  label: string;
  question: string;
  trace: TraceStep[];
  running?: boolean;
  narration?: React.ReactNode;
  note?: string | null;
  footer?: { model: string; ms: string; sources: string[] } | null;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  animated?: boolean;
}) {
  return (
    <article
      aria-label={`Answer: ${question}`}
      className="pointer-events-auto flex max-h-full w-full flex-col border border-rule bg-surface/95 shadow-[0_2px_24px_rgba(28,26,23,0.08)] backdrop-blur-[2px]"
    >
      <Cascade animated={animated} order={0}>
        <header className="flex items-baseline gap-x-4 border-b border-rule-faint px-5 py-3 sm:px-7">
          {animated ? (
            <motion.span
              initial={{ rotate: -8, scale: 1.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="shrink-0 font-mono text-[10px] tracking-[0.18em] text-accent uppercase motion-reduce:transform-none"
            >
              {label}
            </motion.span>
          ) : (
            <span className="shrink-0 font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
              {label}
            </span>
          )}
          <h2 className="min-w-0 truncate text-base font-medium tracking-tight italic sm:text-lg">
            “{question}”
          </h2>
          {actions ? <span className="ml-auto shrink-0">{actions}</span> : null}
        </header>
      </Cascade>

      <Cascade animated={animated} order={1}>
        <div className="border-b border-rule-faint px-5 py-2.5 sm:px-7">
          <TraceStrip steps={trace} running={running} />
        </div>
      </Cascade>

      <div className="card-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
        {narration ? (
          <Cascade animated={animated} order={2}>
            <div
              aria-live="polite"
              className="max-w-prose text-[15px] leading-relaxed whitespace-pre-wrap text-ink"
            >
              {narration}
            </div>
          </Cascade>
        ) : null}
        {note ? (
          <Cascade animated={animated} order={2}>
            <p className="mt-3 max-w-prose font-mono text-[11px] leading-relaxed text-accent">
              ⚿ {note}
            </p>
          </Cascade>
        ) : null}
        {children ? <div className="mt-5 space-y-6">{children}</div> : null}
      </div>

      {footer ? (
        <Cascade animated={animated} order={1}>
          <footer className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-rule-faint px-5 py-2.5 font-mono text-[10px] text-ink-faint sm:px-7 sm:text-[11px]">
            <span className="min-w-0">
              sources:{" "}
              {footer.sources.map((s, i) => (
                <span key={s}>
                  {i > 0 ? " · " : ""}
                  <span className="text-ink-muted">{s}</span>
                </span>
              ))}
            </span>
            <span className="ml-auto whitespace-nowrap">
              {footer.model} · {footer.ms}
            </span>
          </footer>
        </Cascade>
      ) : null}
    </article>
  );
}
