"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { changelog } from "@/data/portfolio";

/** Experience as versioned releases, newest first. */
export function Changelog() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-px bg-rule"
      />
      <motion.span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-px origin-top bg-accent"
        initial={reduce ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-48px" }}
        transition={{
          duration: reduce ? 0 : 1.1,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
      <ol className="relative space-y-12 pl-7 sm:pl-9">
        {changelog.map((r, i) => (
          <li key={r.version} className="relative">
            <motion.span
              aria-hidden
              className="absolute top-1.5 -left-[33px] size-2.5 rounded-full border-2 border-accent bg-paper sm:-left-[41px]"
              initial={reduce ? false : { opacity: 0, scale: 0.25 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{
                duration: reduce ? 0 : 0.3,
                delay: reduce ? 0 : i * 0.12,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            />
            <Reveal delay={reduce ? 0 : i * 0.06}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="bg-accent-soft px-2 py-0.5 font-mono text-[12px] font-medium text-accent">
                  {r.version}
                </span>
                <h3 className="text-lg font-medium tracking-tight sm:text-xl">
                  {r.role} ·{" "}
                  {r.orgHref ? (
                    <a
                      href={r.orgHref}
                      className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                    >
                      {r.org}
                    </a>
                  ) : (
                    r.org
                  )}
                </h3>
                <span className="font-mono text-[12px] text-ink-faint">
                  {r.span}
                  {r.placeholder ? (
                    <span className="placeholder-mark" title={r.placeholder}>
                      {" "}
                      *
                    </span>
                  ) : null}
                </span>
              </div>
              <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-muted">
                {r.summary}
              </p>
              <ul className="mt-3 max-w-prose space-y-1.5">
                {r.notes.map((n) => (
                  <li
                    key={n}
                    className="flex gap-2.5 text-[14px] leading-relaxed text-ink-muted"
                  >
                    <span aria-hidden className="font-mono text-accent">
                      —
                    </span>
                    {n}
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
