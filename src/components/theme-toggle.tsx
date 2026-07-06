"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

/**
 * Light ⇄ dark toggle. Where the browser supports the View Transitions
 * API (and motion isn't reduced), the new theme floods the page as a
 * circle of ink poured from the toggle itself.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="inline-block h-6 w-24" aria-hidden />;
  }

  const dark = resolvedTheme === "dark";

  function toggle() {
    const next = dark ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (!doc.startViewTransition || reduce) {
      setTheme(next);
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      document.documentElement.style.setProperty(
        "--vt-x",
        `${rect.left + rect.width / 2}px`,
      );
      document.documentElement.style.setProperty(
        "--vt-y",
        `${rect.top + rect.height / 2}px`,
      );
    }
    doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      className="inline-flex h-6 items-center gap-1.5 font-mono text-[11px] tracking-widest text-ink-muted uppercase transition-colors hover:text-accent"
      aria-pressed={dark}
      title={dark ? "Switch to light (paper) theme" : "Switch to dark (microfiche) theme"}
    >
      <span
        aria-hidden
        className={`inline-block size-2 rounded-full border border-current ${dark ? "" : "bg-current"}`}
      />
      {dark ? "microfiche" : "paper"}
    </button>
  );
}
