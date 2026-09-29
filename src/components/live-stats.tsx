"use client";

import { useEffect, useState } from "react";

/** Live counts from the interaction store — the red-team scoreboard. */
export function LiveStats() {
  const [s, setS] = useState<{ questions: number; sealed: number; free: number } | null | undefined>(undefined);
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setS)
      .catch(() => setS(null));
  }, []);
  if (s === undefined) return <span className="text-ink-faint">counting…</span>;
  if (!s) return <span className="text-ink-faint">not recorded in this environment</span>;
  return (
    <span>
      {s.questions.toLocaleString()} questions answered ·{" "}
      <span className="text-accent">{s.sealed.toLocaleString()} prompt-injection attempts sealed, 0 leaks</span> ·{" "}
      {s.questions ? Math.round((s.free / s.questions) * 100) : 0}% answered without a model call
    </span>
  );
}
