import { Reveal } from "@/components/reveal";
import type { CaseStudy } from "@/data/portfolio";

/**
 * A project presented as a figure in the report: problem → approach →
 * measured results, with the stack and links as the caption.
 */
export function CaseStudyFigure({ study }: { study: CaseStudy }) {
  return (
    <Reveal>
      <article
        aria-labelledby={`fig-${study.fig}-title`}
        className="border border-rule bg-surface"
      >
        {/* Figure header */}
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-rule-faint px-5 py-4 sm:px-7">
          <span className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
            Fig. {study.fig}
          </span>
          <h3
            id={`fig-${study.fig}-title`}
            className="text-xl font-medium tracking-tight sm:text-2xl"
          >
            {study.title}
          </h3>
          <span className="ml-auto font-mono text-[11px] text-ink-faint">
            {study.domain} · {study.year}
          </span>
        </header>

        <div className="grid gap-x-10 gap-y-6 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_240px]">
          <div className="space-y-5 text-[15px] leading-relaxed">
            <div>
              <h4 className="mb-1.5 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
                Problem
              </h4>
              <p className="text-ink-muted">{study.problem}</p>
            </div>
            <div>
              <h4 className="mb-1.5 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
                Approach
              </h4>
              <p className="text-ink-muted">{study.approach}</p>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
              Results
            </h4>
            <ul className="space-y-3">
              {study.results.map((r) => (
                <li key={r.metric} className="border-l-2 border-accent pl-3">
                  <p className="font-mono text-[13px] leading-snug text-accent">
                    {r.metric}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
                    {r.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Caption */}
        <footer className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-rule-faint px-5 py-3.5 font-mono text-[12px] text-ink-faint sm:px-7">
          <p>{study.stack.join(" · ")}</p>
          <p className="ml-auto flex gap-5">
            {study.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {l.label} ↗
              </a>
            ))}
          </p>
        </footer>
      </article>
    </Reveal>
  );
}
