import { ContactLink } from "@/components/contact-link";
import {
  changelog,
  github,
  keyResults,
  personal,
  resume,
  scratchIndex,
  site,
  socials,
} from "@/data/portfolio";
import scorecard from "@/data/eval-scorecard.json";
import { LiveStats } from "@/components/live-stats";

const rows: { label: string; value: React.ReactNode }[] = [
  {
    label: "Model",
    value: `DIV-1 · rev ${site.revision} — keyword rules + BM25 retrieval over a verified dossier → typed artifacts, with LLM narration`,
  },
  {
    label: "Represents",
    value: `${personal.name} — ${personal.roles.join(", ")}`,
  },
  {
    label: "Current",
    value: (
      <>
        Founding Engineer @{" "}
        <a
          href="https://uniiq.ai"
          className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          Uniiq
        </a>{" "}
        — AI-powered college advising · {personal.location}
      </>
    ),
  },
  { label: "Status", value: <span className="text-accent">{personal.openTo}</span> },
  {
    label: "History",
    value: changelog.map((r) => `${r.version} ${r.org} (${r.span})`).join(" · "),
  },
  {
    label: "Grounding",
    value: `résumé.pdf · github/${github.user} (${github.publicRepos} public repos, ${scratchIndex.length} from-scratch systems) · repo READMEs · Uniiq engineering work summary`,
  },
  {
    label: "Router eval",
    value: `${scorecard.router.passed}/${scorecard.router.total} golden questions routed correctly · injection screen ${scorecard.guard.passed}/${scorecard.guard.total} · measured at build, ${scorecard.at}`,
  },
  {
    label: "Eval results",
    value: keyResults.map((r) => `${r.display} ${r.label}`).join(" · "),
  },
  {
    label: "Live record",
    value: <LiveStats />,
  },
  {
    label: "Privacy",
    value:
      "Questions are logged to improve answers — redacted (emails, numbers, links removed), with a salted visitor hash, never an IP. Job descriptions in the fit check never leave your browser.",
  },
  {
    label: "Contact",
    value: (
      <span className="flex flex-wrap gap-x-5 gap-y-1">
        <ContactLink
          href={`mailto:${personal.email}`}
          via="system-card"
          className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          {personal.email}
        </ContactLink>
        <ContactLink
          href={resume.href}
          via="system-card"
          className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          Résumé (PDF) ↓
        </ContactLink>
      </span>
    ),
  },
  {
    label: "Elsewhere",
    value: (
      <span className="flex flex-wrap gap-x-5 gap-y-1">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            {s.label} ↗
          </a>
        ))}
      </span>
    ),
  },
  {
    label: "Limitations",
    value: (
      <span className="text-ink-muted">
        DIV-1 speaks only from its verified dossier — if something isn&rsquo;t
        on record, it says so rather than guess. Its own internals stay sealed.
        Nothing here is invented.
      </span>
    ),
  },
  {
    label: "Safety",
    value: (
      <span className="text-ink-muted">
        Queries pass a deterministic injection screen before any model sees
        them; narration is constrained to router-selected dossier slices and
        every run cites its sources.
      </span>
    ),
  },
];

/** DIV-1's model card, rendered as an artifact. */
export function SystemCard() {
  return (
    <dl className="divide-y divide-rule-faint border-y border-rule">
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid gap-1 py-3.5 text-[14px] leading-relaxed sm:grid-cols-[150px_1fr] sm:gap-8"
        >
          <dt className="font-mono text-[11px] leading-6 tracking-[0.15em] text-ink-faint uppercase">
            {r.label}
          </dt>
          <dd className="min-w-0">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
