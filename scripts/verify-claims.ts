/** Verify the complete dated snapshot, including open and closed-without-merge PRs. */
import { github, mastraIssueContributions, upstreamSnapshot } from "@/data/portfolio";

const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "div1-claims" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com/${path}`, { headers, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return (await res.json()) as T;
}

interface Stats { authored: number; merged: number; open: number; closed: number }
interface Pull { repository_url: string; state: string; pull_request: { merged_at: string | null } }
const empty = (): Stats => ({ authored: 0, merged: 0, open: 0, closed: 0 });
const totals = empty();
const repos: Record<string, Stats> = {};
let expectedTotal = 0;
for (let page = 1; ; page++) {
  const data = await gh<{ total_count: number; incomplete_results: boolean; items: Pull[] }>(
    `search/issues?q=${encodeURIComponent(upstreamSnapshot.query)}&per_page=100&page=${page}&sort=created&order=desc`,
  );
  if (data.incomplete_results || data.total_count > 1000) throw new Error("Incomplete GitHub search; partition the query before verifying counts.");
  if (page > 1 && data.total_count !== expectedTotal) throw new Error("GitHub changed during pagination; rerun verification.");
  expectedTotal = data.total_count;
  for (const pr of data.items) {
    const repo = pr.repository_url.replace("https://api.github.com/repos/", "");
    const state = pr.pull_request.merged_at ? "merged" : pr.state === "open" ? "open" : "closed";
    const row = repos[repo] ??= empty();
    row.authored++; row[state]++; totals.authored++; totals[state]++;
  }
  if (data.items.length < 100) break;
}
if (totals.authored !== expectedTotal) throw new Error("GitHub pagination did not return every PR.");

const drift: string[] = [];
let checked = 0;
function check(label: string, claimed: number, actual: number) {
  checked++;
  if (claimed !== actual) drift.push(`${label}: snapshot ${claimed}, GitHub ${actual}`);
}
for (const key of Object.keys(totals) as (keyof Stats)[]) check(`total ${key}`, upstreamSnapshot.totals[key], totals[key]);
const saved: Record<string, Stats> = upstreamSnapshot.repositories;
for (const repo of new Set([...Object.keys(saved), ...Object.keys(repos)])) {
  for (const key of Object.keys(totals) as (keyof Stats)[]) check(`${repo} ${key}`, saved[repo]?.[key] ?? 0, repos[repo]?.[key] ?? 0);
}
const issueCount = await gh<{ total_count: number; incomplete_results: boolean }>(
  `search/issues?q=${encodeURIComponent(`repo:mastra-ai/mastra author:${github.user} is:issue`)}&per_page=1`,
);
if (issueCount.incomplete_results) throw new Error("Incomplete issue search");
check("Mastra authored issues", mastraIssueContributions.summary.authored, issueCount.total_count);
const resolutions = new Map(mastraIssueContributions.issues.flatMap((issue) => issue.resolution ? [[issue.resolution.number, issue.resolution] as const] : []));
for (const [number, resolution] of resolutions) {
  const pr = await gh<{ merged_at: string | null; user: { login: string } }>(`repos/mastra-ai/mastra/pulls/${number}`);
  if (!pr.merged_at || pr.user.login !== resolution.author) drift.push(`Mastra issue resolution #${number} changed`);
}
const user = await gh<{ public_repos: number }>(`users/${github.user}`);
check("public repos", github.publicRepos, user.public_repos);
let stars = 0;
for (let page = 1; ; page++) {
  const own = await gh<{ fork: boolean; stargazers_count: number }[]>(`users/${github.user}/repos?type=owner&per_page=100&page=${page}`);
  stars += own.filter((r) => !r.fork).reduce((n, r) => n + r.stargazers_count, 0);
  if (own.length < 100) break;
}
check("stars across owned non-fork repos", github.stars, stars);
console.log(`${checked - drift.length}/${checked} numeric claims match the ${github.asOf} snapshot`);
if (drift.length) {
  console.error(`Update src/data/github-snapshot.json and its evidence:\n  ${drift.join("\n  ")}`);
  process.exit(1);
}
