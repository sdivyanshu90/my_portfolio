"use client";

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Fade + slide a block in on mount (staggered via `delay`). Mount-based rather
 * than scroll-based so it stays correct inside internally-scrolling panes —
 * content below the fold never gets stuck invisible. Honors reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: SMOOTH_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function formatValue(value: number, decimals: number, padTo: number) {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }

  const rounded = Math.round(value).toString();
  return padTo > 0 ? rounded.padStart(padTo, "0") : rounded;
}

/**
 * Animate a number from 0 up to `value` once it scrolls into view.
 * Reduced-motion users see the final value immediately.
 */
export function CountUp({
  value,
  decimals = 0,
  padTo = 0,
  prefix = "",
  suffix = "",
  duration = 1.1,
  className,
}: {
  value: number;
  decimals?: number;
  padTo?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() =>
    formatValue(reduce ? value : 0, decimals, padTo),
  );

  useEffect(() => {
    if (!inView) return;

    if (reduce) {
      setDisplay(formatValue(value, decimals, padTo));
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: SMOOTH_EASE,
      onUpdate: (current) => setDisplay(formatValue(current, decimals, padTo)),
    });

    return () => controls.stop();
  }, [inView, value, decimals, padTo, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/**
 * A thin gradient bar pinned to the top of the page that tracks document
 * scroll progress. Invisible (zero width) until the page is scrolled, so it
 * never looks broken on viewport-locked layouts. Hidden for reduced motion.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500"
    />
  );
}
