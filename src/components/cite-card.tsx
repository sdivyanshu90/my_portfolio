"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { citation } from "@/data/portfolio";

/** BibTeX-style contact card with a copy-to-clipboard interaction. */
export function CiteCard() {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  async function copy() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — no-op.
    }
  }

  return (
    <figure className="min-w-0 border border-rule bg-surface">
      <figcaption className="flex items-center justify-between border-b border-rule-faint px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
          Cite this engineer
        </span>
        <button
          type="button"
          onClick={copy}
          className="font-mono text-[11px] tracking-wider text-ink-muted uppercase transition-colors hover:text-accent"
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "copied" : "copy"}
              className="inline-block"
              initial={
                reduce
                  ? false
                  : { opacity: 0, scale: 0.7, rotate: copied ? -8 : 0 }
              }
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.75, rotate: 6 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            >
              {copied ? "✓ copied" : "copy"}
            </motion.span>
          </AnimatePresence>
        </button>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed text-ink-muted">
        <code>{citation}</code>
      </pre>
    </figure>
  );
}
