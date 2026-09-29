import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyFigure } from "@/components/case-study";
import { DocSection, DocShell } from "@/components/doc/doc-shell";
import { caseStudies, changelog, personal, scratchIndex, site } from "@/data/portfolio";
import { search } from "@/lib/retrieval";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ id: c.id }));
}

/** Which release in the changelog a figure belongs to, where there is one. */
const RELEASE: Record<string, string> = {
  "uniiq-platform": "v3.0",
  "mpc-deep-learning": "v2.0",
};

const find = (id: string) => caseStudies.find((c) => c.id === id);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = find((await params).id);
  if (!c) return {};
  const lead = `${c.results[0].metric} — ${c.results[0].detail}`;
  return {
    title: c.title,
    description: `${lead}. ${c.problem}`.slice(0, 300),
    alternates: { canonical: `/work/${c.id}` },
    openGraph: { type: "article", title: `${c.title} — ${personal.name}`, description: lead, url: `/work/${c.id}` },
  };
}

/** From-scratch systems closest to this figure, by the console's own retrieval. */
function related(id: string) {
  const c = find(id)!;
  const hits = search(`${c.title} ${c.stack.join(" ")} ${c.domain}`).filter((h) => h.doc.kind === "index");
  const top = hits[0]?.score ?? 0;
  return hits
    .filter((h) => h.score >= top * 0.4)
    .slice(0, 5)
    .map((h) => scratchIndex.find((e) => e.repo === h.doc.star)!)
    .filter(Boolean);
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = find(id);
  if (!c) notFound();
  const i = caseStudies.indexOf(c);
  const prev = caseStudies[(i - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(i + 1) % caseStudies.length];
  const release = changelog.find((r) => r.version === RELEASE[c.id]);
  const repos = related(c.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: c.title,
    about: c.domain,
    dateCreated: c.year,
    author: { "@type": "Person", name: personal.name, url: site.url },
    description: c.problem,
    url: `${site.url}/work/${c.id}`,
    keywords: c.stack.join(", "),
  };

  return (
    <DocShell
      current="/work"
      eyebrow={
        <>
          <Link href="/work" className="hover:underline">
            Work
          </Link>{" "}
          / Fig. {c.fig} · {c.domain} · {c.year}
        </>
      }
      title={c.title}
      lede={
        <p>
          <span className="font-mono text-accent">{c.results[0].metric}</span> — {c.results[0].detail}.
        </p>
      }
      ask={[`Tell me about ${c.title}`, `What was hard about ${c.title.split(" — ")[0]}?`, "Is he available, and for what roles?"]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CaseStudyFigure study={c} />

      {release ? (
        <DocSection id="role" title={`Release ${release.version} · ${release.span}`}>
          <p className="text-[15px] text-ink">
            {release.role} — {release.org}
          </p>
          <ul className="mt-3 space-y-2">
            {release.notes.map((n) => (
              <li key={n} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-muted">
                <span aria-hidden className="font-mono text-accent">
                  +
                </span>
                {n}
              </li>
            ))}
          </ul>
        </DocSection>
      ) : null}

      {repos.length ? (
        <DocSection id="related" title="Related from-scratch systems" note="matched by the console's retrieval">
          <ul className="divide-y divide-rule-faint border-y border-rule-faint">
            {repos.map((e) => (
              <li key={e.repo} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 text-[14px]">
                <a href={`https://github.com/${e.repo}`} className="font-medium text-ink underline decoration-rule underline-offset-4 hover:text-accent">
                  {e.name} ↗
                </a>
                <span className="font-mono text-[11px] text-ink-faint">
                  {e.layer} · {e.lang}
                </span>
                <span className="w-full text-ink-muted">{e.summary}</span>
              </li>
            ))}
          </ul>
        </DocSection>
      ) : null}

      <nav aria-label="More figures" className="mt-14 flex justify-between gap-4 font-mono text-[12px] print:hidden">
        <Link href={`/work/${prev.id}`} className="text-ink-muted hover:text-accent">
          ← Fig. {prev.fig} {prev.title.split(" — ")[0]}
        </Link>
        <Link href={`/work/${next.id}`} className="text-right text-ink-muted hover:text-accent">
          Fig. {next.fig} {next.title.split(" — ")[0]} →
        </Link>
      </nav>
    </DocShell>
  );
}
