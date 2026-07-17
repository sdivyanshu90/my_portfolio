"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
          className="inline-flex items-center gap-2 whitespace-nowrap"
          initial={reduce ? false : { opacity: 0, x: -8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <span>
            <span className="text-accent">▸</span> {s.step}: {s.detail}
          </span>
          {i < steps.length - 1 || running ? (
            <span
              aria-hidden
              className="relative hidden h-px w-4 overflow-hidden bg-rule sm:inline-block"
            >
              <motion.span
                className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-accent"
                initial={reduce ? false : { x: -4, opacity: 0 }}
                animate={
                  reduce
                    ? { x: 10, opacity: 1 }
                    : { x: 16, opacity: [0, 1, 1, 0] }
                }
                transition={{ duration: reduce ? 0 : 0.45, ease: "easeInOut" }}
              />
            </span>
          ) : null}
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
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    progress: 0,
    scrollable: false,
  });

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    const update = () => {
      const distance = scroller.scrollHeight - scroller.clientHeight;
      const next = {
        progress: distance > 0 ? scroller.scrollTop / distance : 0,
        scrollable: distance > 8,
      };
      setScrollState((current) =>
        current.scrollable === next.scrollable &&
        Math.abs(current.progress - next.progress) < 0.001
          ? current
          : next,
      );
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(content);
    window.addEventListener("resize", update);

    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [children, narration, note]);

  return (
    <article
      aria-label={`Answer: ${question}`}
      className="pointer-events-auto relative flex max-h-full w-full flex-col border border-rule bg-surface/95 shadow-[0_2px_24px_rgba(28,26,23,0.08)] backdrop-blur-[2px]"
    >
      {scrollState.scrollable ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-[-1px] z-10 h-full w-0.5 overflow-hidden bg-rule-faint"
        >
          <motion.span
            className="block h-full origin-top bg-accent"
            initial={false}
            animate={{ scaleY: scrollState.progress }}
            transition={{ duration: reduce ? 0 : 0.12, ease: "easeOut" }}
          />
        </span>
      ) : null}
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

      <div
        ref={scrollRef}
        className="card-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7"
      >
        <div ref={contentRef}>
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
      </div>

      {footer ? (
        <Cascade animated={animated} order={1}>
          <footer className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-rule-faint px-5 py-2.5 font-mono text-[10px] text-ink-faint sm:px-7 sm:text-[11px]">
            <span className="flex min-w-0 flex-wrap items-center gap-1.5">
              sources:{" "}
              {footer.sources.map((s, i) => (
                <motion.span
                  key={s}
                  className="inline-block border border-rule-faint px-1 py-0.5 text-ink-muted"
                  initial={
                    animated && !reduce
                      ? {
                          opacity: 0,
                          scale: 1.18,
                          rotate: i % 2 === 0 ? -2 : 2,
                        }
                      : false
                  }
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.28,
                    delay: reduce ? 0 : 0.1 + i * 0.07,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  {s}
                </motion.span>
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
