"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";

// A soft glow that trails the pointer (GPU transform only). Sits behind the
// glass panels so it subtly lights up the frosted surfaces as it passes.
// Disabled for reduced-motion users and on touch (no pointer hover).
export default function SpotlightCursor() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 140, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 140, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (reduce) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, x, y]);

  if (reduce) return null;

  return <motion.div aria-hidden className="spotlight-orb" style={{ x: sx, y: sy }} />;
}
