import { certifications, honors } from "@/data/portfolio";

/** Certifications and honors, verbatim from the résumé. */
export function Credentials() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <h3 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Certifications
        </h3>
        <ul className="mt-4 divide-y divide-rule-faint border-y border-rule-faint">
          {certifications.map((c) => (
            <li
              key={c.name}
              className="flex items-baseline justify-between gap-4 py-3 text-[14px]"
            >
              <span className="text-ink">{c.name}</span>
              <span className="shrink-0 font-mono text-[12px] text-ink-faint">
                {c.issuer} · {c.year}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Honors
        </h3>
        <ul className="mt-4 space-y-3">
          {honors.map((h) => (
            <li
              key={h}
              className="flex gap-2.5 text-[14px] leading-relaxed text-ink-muted"
            >
              <span aria-hidden className="font-mono text-accent">
                ✓
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
