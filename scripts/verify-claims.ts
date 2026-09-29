/**
 * Claims that can't rot: re-verify every open-source number in the dossier
 * against the GitHub API. Exits 1 on drift, printing what changed, so the
 * scheduled workflow (.github/workflows/claims.yml) can open an issue.
 *   GITHUB_TOKEN=… npm run verify-claims
 */
import { github, openSource } from "@/data/portfolio";

const token = process.env.GITHUB_TOKEN;
const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "div1-claims" };
if (token) headers.Authorization = `Bearer ${token}`;

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com/${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return (await res.json()) as T;
}
const count = async (q: string) =>
  (await gh<{ total_count: number }>(`search/issues?q=${encodeURIComponent(q)}&per_page=1`)).total_count;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const drift: string[] = [];
const ok: string[] = [];
const check = (label: string, claimed: number | undefined, actual: number) => {
  if (claimed === undefined) return;
  (claimed === actual ? ok : drift).push(`${label}: dossier ${claimed}, GitHub ${actual}`);
};

for (const o of openSource) {
  const repo = o.href.match(/github\.com\/([\w.-]+\/[\w.-]+)\/pulls/)?.[1];
  if (!repo || o.role === "Author") continue;
  const base = `repo:${repo} author:${github.user} type:pr`;
  check(`${repo} merged`, o.merged, await count(`${base} is:merged`));
  await sleep(2500); // search API: 30 requests/minute authenticated
  check(`${repo} authored`, o.authored, await count(base));
  await sleep(2500);
  if (o.open !== undefined) {
    check(`${repo} open`, o.open, await count(`${base} is:open`));
    await sleep(2500);
  }
  for (const b of o.reportedFixed ?? []) {
    const pr = await gh<{ merged_at: string | null }>(`repos/${repo}/pulls/${b.landed}`);
    if (!pr.merged_at) drift.push(`${repo}#${b.landed} (fix for #${b.issue}) is no longer merged`);
  }
}
const user = await gh<{ public_repos: number }>(`users/${github.user}`);
check("public repos", github.publicRepos, user.public_repos);

console.log(`✓ ${ok.length} claims match`);
if (drift.length) {
  console.log(`✗ ${drift.length} drifted — update src/data/portfolio.ts:\n  ${drift.join("\n  ")}`);
  process.exit(1);
}
