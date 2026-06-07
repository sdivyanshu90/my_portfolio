"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="glass-chip glass-hover shine relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex"
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-indigo-300" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
