import type { Metadata } from "next";
import { ContactLink } from "@/components/contact-link";
import { DocSection, DocShell } from "@/components/doc/doc-shell";
import { PrintButton } from "@/components/doc/print-button";
import {
  capabilities,
  caseStudies,
  certifications,
  changelog,
  education,
  honors,
  openSource,
  personal,
  resume,
  site,
  socials,
} from "@/data/portfolio";

export const metadata: Metadata = {
  title: "CV",
  description: `${personal.name} — ${personal.lead}. ${personal.currentRole}. ${personal.openTo}.`,
  alternates: { canonical: "/cv" },
};

/**
 * The résumé, generated from the same dossier as everything else — so the
 * PDF (print this page) can never disagree with the site. Dense on screen,
 * two clean pages on paper.
 */
export default function Cv() {
  const linkedin = socials.find((s) => s.label === "LinkedIn");
  const github = socials.find((s) => s.label === "GitHub");
  const roles = changelog.filter((r) => !r.role.startsWith("B.E."));
  const upstream = openSource.filter((o) => o.role !== "Author");

  return (
    <DocShell
      current="/cv"
      eyebrow={
        <span className="flex flex-wrap items-center gap-3">
          <span>Curriculum vitae · generated from the dossier · rev {site.revision}</span>
          <span className="print:hidden">
            <PrintButton />
          </span>
        </span>
      }
      title={personal.name}
      lede={
        <div className="space-y-1">
          <p className="text-ink">
            {personal.lead} · {personal.focus} · {personal.currentRole} · {personal.location}
          </p>
          <p className="font-mono text-[12px]">
            <ContactLink href={`mailto:${personal.email}`} via="cv" className="underline underline-offset-2">
              {personal.email}
            </ContactLink>
            {" · "}
            <a href={site.url} className="underline underline-offset-2">
              {site.url.replace("https://", "")}
            </a>
            {github ? ` · github.com/${github.handle}` : ""}
            {linkedin ? ` · linkedin.com/in/${linkedin.handle}` : ""}
          </p>
          <p className="font-mono text-[12px] text-accent">● {personal.openTo}</p>
        </div>
      }
    >
      <div className="cv space-y-0 text-[14px] leading-relaxed">
        <DocSection id="summary" title="Summary">
          <p className="max-w-prose text-ink-muted">{personal.abstract[0]}</p>
        </DocSection>

        <DocSection id="experience" title="Experience">
          <ol className="space-y-6">
            {roles.map((r) => (
              <li key={r.version} className="cv-block">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-medium text-ink">
                    {r.role} — {r.org}
                  </p>
                  <p className="font-mono text-[12px] text-ink-faint">{r.span}</p>
                </div>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-ink-muted marker:text-rule">
                  {r.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </DocSection>

        <DocSection id="work" title="Selected work">
          <ul className="space-y-4">
            {caseStudies.map((c) => (
              <li key={c.id} className="cv-block">
                <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <a href={`/work/${c.id}`} className="font-medium text-ink underline decoration-rule underline-offset-4">
                    {c.title}
                  </a>
                  <span className="font-mono text-[12px] text-ink-faint">
                    {c.domain} · {c.year}
                  </span>
                </p>
                <p className="text-ink-muted">
                  {c.results
                    .slice(0, 2)
                    .map((r) => `${r.metric} — ${r.detail}`)
                    .join("; ")}
                  .
                </p>
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection id="oss" title="Open source">
          <ul className="space-y-2">
            {upstream.map((o) => (
              <li key={o.href} className="cv-block">
                <span className="font-medium text-ink">{o.name}</span>{" "}
                <span className="font-mono text-[11px] text-ink-faint">
                  {o.role === "Contributor"
                    ? `${o.merged} merged PRs`
                    : o.role === "In review"
                      ? `${o.open} in review`
                      : "proposal, in review"}
                </span>
                <span className="text-ink-muted"> — {o.summary}</span>
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection id="skills" title="Skills">
          <dl className="space-y-1.5">
            {capabilities.map((c) => (
              <div key={c.area} className="grid gap-x-6 sm:grid-cols-[170px_1fr]">
                <dt className="font-mono text-[11px] leading-6 tracking-[0.12em] text-ink-faint uppercase">{c.area}</dt>
                <dd className="text-ink-muted">{c.items}</dd>
              </div>
            ))}
          </dl>
        </DocSection>

        <DocSection id="education" title="Education, certifications & honors">
          <p className="flex flex-wrap items-baseline justify-between gap-x-4">
            <span className="font-medium text-ink">
              {education.degree} — {education.school}
            </span>
            <span className="font-mono text-[12px] text-ink-faint">
              {education.grade} · {education.span}
            </span>
          </p>
          <p className="mt-2 text-ink-muted">
            {certifications.map((c) => `${c.name} (${c.issuer}, ${c.year})`).join(" · ")}
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-ink-muted marker:text-rule">
            {honors.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </DocSection>

        <p className="mt-10 font-mono text-[11px] text-ink-faint print:hidden">
          The one-page PDF résumé is also{" "}
          <ContactLink href={resume.href} via="cv" className="underline underline-offset-2">
            available here
          </ContactLink>
          ; this page is the long form, generated from the same facts the console answers from.
        </p>
      </div>
    </DocShell>
  );
}
