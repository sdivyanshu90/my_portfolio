"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * One-time, in-view reveal: a small rise + fade that establishes reading
 * order as the report is scrolled. Renders children statically when the
 * visitor prefers reduced motion (and in the server HTML, so no-JS visitors
 * see everything).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Hairline rule that draws itself left→right when it enters the viewport. */
export function RuleDraw({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={`h-px bg-rule ${className ?? ""}`} />;
  }

  return (
    <motion.div
      aria-hidden
      className={`h-px origin-left bg-rule ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    />
  );
}
