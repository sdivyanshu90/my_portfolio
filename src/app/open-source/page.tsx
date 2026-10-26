import type { Metadata } from "next";
import { DocSection, DocShell } from "@/components/doc/doc-shell";
import { contributionStatus, counts, fieldGuides, github, openSource, upstreamSnapshot, mastraIssueContributions } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Open source",
  description: `${counts.mergedUpstream} merged upstream pull requests — Mastra, EleutherAI's lm-evaluation-harness, the p5.js Web Editor — plus teaching curricula. Every claim links to the PRs.`,
  alternates: { canonical: "/open-source" },
};

const link = "underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

export default function OpenSource() {
  const upstream = openSource.filter((o) => o.role !== "Author");
  const own = openSource.filter((o) => o.role === "Author");
  return (
    <DocShell
      current="/open-source"
      eyebrow={`${counts.authoredUpstream} PRs upstream · ${counts.mergedUpstream} merged · ${counts.reportedFixed} bugs he reported, fixed upstream`}
      title="Open source, with the PRs attached"
      lede={
        <p>
          Every issue and pull request here is his — found, written and sent upstream to projects like Mastra,
          EleutherAI and OpenCode. Counts are a GitHub API snapshot from {github.asOf}, covering public PRs authored outside his own repositories. Open means still open on GitHub; closed without merge is tracked separately.
        </p>
      }
      ask={["What open-source work has he done?", "Is he a core contributor at Mastra?", "What did he contribute to EleutherAI's lm-evaluation-harness?"]}
    >
      <DocSection id="upstream" title="Selected upstream contributions">
        <ul className="space-y-8">
          {upstream.map((o) => (
            <li key={o.href}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <a href={o.href} className={`text-lg font-medium text-ink ${link}`}>
                  {o.name} ↗
                </a>
                <span className="bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-accent uppercase">
                  {contributionStatus(o)}
                </span>
              </div>
              <p className="mt-1.5 max-w-prose text-[15px] leading-relaxed text-ink-muted">{o.summary}</p>
              {o.notable?.length ? (
                <ul className="mt-2 space-y-1 font-mono text-[12px]">
                  {o.notable.map((pr) => (
                    <li key={pr.href}>
                      <a href={pr.href} className={`text-ink-faint ${link}`}>
                        ↳ {pr.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {o.reportedFixed?.length && o.repo ? (
                <details className="mt-4 border border-rule-faint">
                  <summary className="cursor-pointer px-4 py-2.5 font-mono text-[12px] text-ink-muted hover:text-accent">
                    Found → reported → fixed upstream: {o.reportedFixed.length} bugs (evidence)
                  </summary>
                  <div className="overflow-x-auto border-t border-rule-faint px-4 py-3">
                    <p className="mb-3 max-w-prose text-[13px] leading-relaxed text-ink-muted">
                      He found each bug, filed the issue and wrote the fix. Mastra&apos;s triage bot closed the PRs
                      while the issues awaited triage; fixes for every one of these issues were then merged. The
                      issue, his fix and the merged fix are linked side by side.
                    </p>
                    <table className="report-table w-full min-w-[560px] text-left text-[12px]">
                      <thead>
                        <tr className="font-mono text-[11px] tracking-[0.15em] text-ink-faint uppercase">
                          <th className="py-2 pr-3 font-medium">Bug he reported</th>
                          <th className="py-2 pr-3 font-medium">His fix</th>
                          <th className="py-2 font-medium">Merged fix</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {o.reportedFixed.map((b) => (
                          <tr key={b.issue}>
                            <td className="py-1.5 pr-3">
                              <a href={`https://github.com/${o.repo}/issues/${b.issue}`} className={`text-ink-muted ${link}`}>
                                #{b.issue}
                              </a>{" "}
                              <span className="font-serif text-ink-muted">{b.title}</span>
                            </td>
                            <td className="py-1.5 pr-3">
                              <a href={`https://github.com/${o.repo}/pull/${b.pr}`} className={`text-ink-faint ${link}`}>
                                #{b.pr}
                              </a>
                            </td>
                            <td className="py-1.5">
                              <a href={`https://github.com/${o.repo}/pull/${b.landed}`} className={`text-ink-faint ${link}`}>
                                #{b.landed}
                              </a>
                              {b.credited ? <span className="ml-2 text-accent">co-authored</span> : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="issue-contributions" title="Mastra issue contributions" note={`Public evidence · ${mastraIssueContributions.asOf}`}>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          {mastraIssueContributions.summary.authored} authored issue reports; {mastraIssueContributions.summary.resolvedByOthers} resolved through merged fixes by other upstream authors and {mastraIssueContributions.summary.resolvedByOwnPR} through his own merged PRs.
          {" "}{mastraIssueContributions.summary.open} remain open; {mastraIssueContributions.summary.closedWithoutLinkedMerge} are closed without a linked merged resolution.
          Issue outcomes overlap with PR counts and are presented separately.
        </p>
        <details className="mt-4 border border-rule-faint p-4">
          <summary className="cursor-pointer text-accent">View public reports and linked resolutions</summary>
          <ul className="mt-3 space-y-3 text-[13px]">
            {mastraIssueContributions.issues.map((issue) => (
              <li key={issue.number}>
                <a href={issue.url} className={link}>#{issue.number} · {issue.title}</a>
                {issue.resolution ? <> — <a href={issue.resolution.url} className={link}>merged fix #{issue.resolution.number}</a> ({issue.resolution.author})</> : ` — ${issue.state}; no linked merged resolution`}
              </li>
            ))}
          </ul>
        </details>
      </DocSection>

      <DocSection id="snapshot" title="Complete public upstream snapshot" note={`Verified ${github.asOf}`}>
        <p className="mb-4 text-[14px] text-ink-muted">
          {upstreamSnapshot.totals.authored} authored PRs: {upstreamSnapshot.totals.merged} merged,
          {" "}{upstreamSnapshot.totals.open} open and {upstreamSnapshot.totals.closed} closed without merge.
          The reported-fix evidence above is separate from these merge counts.
        </p>
        <div className="overflow-x-auto">
          <table className="report-table w-full text-left text-[13px]">
            <thead><tr><th>Repository</th><th>Authored</th><th>Merged</th><th>Open</th><th>Closed without merge</th></tr></thead>
            <tbody>
              {Object.entries(upstreamSnapshot.repositories).map(([repo, stats]) => (
                <tr key={repo}>
                  <td className="py-2 pr-4"><a className={link} href={`https://github.com/${repo}/pulls?q=is%3Apr+author%3A${github.user}`}>{repo}</a></td>
                  <td>{stats.authored}</td><td>{stats.merged}</td><td>{stats.open}</td><td>{stats.closed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="own" title="His own, in public">
        <ul className="space-y-4">
          {own.map((o) => (
            <li key={o.href} className="text-[15px] leading-relaxed">
              <a href={o.href} className={`font-medium text-ink ${link}`}>
                {o.name} ↗
              </a>{" "}
              <span className="text-ink-muted">— {o.summary}</span>
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="teaching" title="Teaching in public">
        <ul className="space-y-3.5">
          {fieldGuides.map((g) => (
            <li key={g.repo} className="text-[15px] leading-relaxed">
              <a href={`https://github.com/${g.repo}`} className={`font-medium text-ink ${link}`}>
                {g.name} ↗
              </a>{" "}
              <span className="text-ink-muted">— {g.summary}</span>
            </li>
          ))}
        </ul>
      </DocSection>
    </DocShell>
  );
}
