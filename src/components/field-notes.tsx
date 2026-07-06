import { fieldGuides, openSource } from "@/data/portfolio";

/** Teaching repos and open-source contributions. */
export function FieldNotes() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <h3 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Field guides — teaching in public
        </h3>
        <ul className="mt-4 space-y-3.5">
          {fieldGuides.map((g) => (
            <li key={g.repo} className="text-[14px] leading-relaxed">
              <a
                href={`https://github.com/${g.repo}`}
                className="font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {g.name}
              </a>{" "}
              <span className="text-ink-muted">— {g.summary}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
          Open source & applied work
        </h3>
        <ul className="mt-4 space-y-3.5">
          {openSource.map((o) => (
            <li key={o.href} className="text-[14px] leading-relaxed">
              <a
                href={o.href}
                className="font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {o.name}
              </a>{" "}
              <span className="text-ink-muted">— {o.summary}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
