"use client";

import { useEffect, useState } from "react";

let hydrated = false;

/**
 * False for anything rendered in the server HTML (and during hydration),
 * true for components mounted afterwards. Scroll-reveal animations use it so
 * server-rendered content is never shipped at opacity 0 — crawlers and no-JS
 * visitors see everything — while answers that mount later still animate.
 */
export function useHydrated(): boolean {
  const [h] = useState(() => hydrated);
  useEffect(() => {
    hydrated = true;
  }, []);
  return h;
}
