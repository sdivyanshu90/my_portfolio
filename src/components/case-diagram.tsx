import type { CaseStudy } from "@/data/portfolio";

/**
 * The figure inside a case study: a pipeline (stages left→right, wrapping
 * on small screens), a fan-out (one source, parallel models), or a
 * before/after comparison. Plain HTML, readable without the drawing.
 */
export function CaseDiagram({ diagram }: { diagram: NonNullable<CaseStudy["diagram"]> }) {
  if (diagram.kind === "pipeline") {
    return (
      <ol aria-label="How it works" className="flex flex-wrap items-stretch gap-y-3">
        {diagram.steps.map((s, i) => (
          <li key={s.label} className="flex items-center">
            <div className={`border px-3 py-2 ${i === diagram.steps.length - 1 ? "border-accent" : "border-rule"} bg-paper`}>
              <p className="text-[13px] leading-snug text-ink">{s.label}</p>
              {s.sub ? <p className="mt-0.5 font-mono text-[11px] leading-snug text-ink-faint">{s.sub}</p> : null}
            </div>
            {i < diagram.steps.length - 1 ? (
              <span aria-hidden className="px-2 font-mono text-[13px] text-accent">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    );
  }
  if (diagram.kind === "fanout") {
    return (
      <div className="grid items-center gap-3 sm:grid-cols-[auto_auto_1fr]">
        <div className="border border-rule bg-paper px-3 py-2 text-[13px] text-ink">{diagram.source}</div>
        <span aria-hidden className="hidden font-mono text-[13px] text-accent sm:block">
          ⇉
        </span>
        <ul aria-label="Models trained on it" className="space-y-2">
          {diagram.branches.map((b) => (
            <li key={b.label} className="border-l-2 border-accent bg-paper px-3 py-1.5">
              <p className="text-[13px] leading-snug text-ink">{b.label}</p>
              {b.sub ? <p className="font-mono text-[11px] leading-snug text-ink-faint">{b.sub}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <ul aria-label="Before and after" className="space-y-4">
      {diagram.rows.map((r) => {
        const max = Math.max(r.before, r.after);
        return (
          <li key={r.label}>
            <p className="text-[13px] text-ink">
              {r.label} <span className="font-mono text-[11px] text-ink-faint">· {r.better} is better</span>
            </p>
            {(
              [
                ["before", r.before, "bg-rule"],
                ["after", r.after, "bg-chart"],
              ] as const
            ).map(([when, v, color]) => (
              <div key={when} className="mt-1 grid grid-cols-[52px_1fr_56px] items-center gap-2">
                <span className="font-mono text-[11px] text-ink-faint">{when}</span>
                <span className="block h-2.5 bg-rule-faint">
                  <span className={`block h-2.5 rounded-r-[4px] ${color}`} style={{ width: `${(v / max) * 100}%` }} />
                </span>
                <span className="text-right font-mono text-[12px] text-ink tabular-nums">
                  {v}
                  {r.unit}
                </span>
              </div>
            ))}
          </li>
        );
      })}
    </ul>
  );
}
