"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Odometer roll for a metric like "88.08%", ">48%", "1.8" — the numeric
 * part rolls up from zero when the artifact materializes. Server-renders
 * (and reduced-motion renders) the final value.
 */
export function CountUp({ display }: { display: string }) {
  const match = display.match(/^([^0-9]*)([\d.]+)(.*)$/);
  const [text, setText] = useState(display);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !match) return;
    done.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num);
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const t0 = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setText(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{text}</>;
}
