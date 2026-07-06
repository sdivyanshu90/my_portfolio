import { capabilities } from "@/data/portfolio";

/** Skills as a stack-layer reference table — no icon grid, no meters. */
export function Capabilities() {
  return (
    <dl className="divide-y divide-rule-faint border-y border-rule">
      {capabilities.map((c) => (
        <div
          key={c.area}
          className="grid gap-1 py-4 sm:grid-cols-[220px_1fr] sm:gap-8"
        >
          <dt className="font-mono text-[11px] leading-6 tracking-[0.15em] text-ink-faint uppercase">
            {c.area}
          </dt>
          <dd className="text-[14px] leading-relaxed text-ink-muted">
            {c.items}
          </dd>
        </div>
      ))}
    </dl>
  );
}
