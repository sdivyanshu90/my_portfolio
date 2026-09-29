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
          Open source — merged upstream, then his own
        </h3>
        <ul className="mt-4 space-y-4">
          {openSource.map((o) => (
            <li key={o.href} className="text-[14px] leading-relaxed">
              <a
                href={o.href}
                className="font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {o.name}
              </a>{" "}
              <span className="ml-1 font-mono text-[11px] tracking-wide text-ink-faint uppercase">
                {o.role === "Contributor"
                  ? `${o.merged} merged`
                  : o.role === "Proposal"
                    ? "proposed · unmerged"
                    : "author"}
              </span>
              <p className="text-ink-muted">{o.summary}</p>
              {o.notable?.length ? (
                <ul className="mt-1.5 space-y-0.5 font-mono text-[11px]">
                  {o.notable.map((pr) => (
                    <li key={pr.href}>
                      <a
                        href={pr.href}
                        className="text-ink-faint underline decoration-rule-faint underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                      >
                        ↳ {pr.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
