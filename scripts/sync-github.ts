/**
 * Snapshot GitHub activity for every star in the sky: when each repo was
 * created (the time-lapse), when it was last pushed and how many stars it
 * has (the living constellation), and when he first opened a PR upstream.
 * Writes src/data/activity.json. Runs before builds; if GitHub is
 * unreachable the committed snapshot is kept, so builds never fail on it.
 *   GITHUB_TOKEN=… npm run sync-github   (token optional: 2 + N requests)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { caseStudies, github, openSource, scratchIndex } from "@/data/portfolio";

const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "div1-sync" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const get = async <T>(path: string): Promise<T> => {
  const res = await fetch(`https://api.github.com/${path}`, { headers, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return (await res.json()) as T;
};

interface RepoInfo {
  created: string;
  pushed: string;
  stars: number;
}

try {
  // Every own repo in two calls.
  type Api = { full_name: string; created_at: string; pushed_at: string; stargazers_count: number };
  const own: Api[] = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await get<Api[]>(`users/${github.user}/repos?per_page=100&page=${page}`);
    own.push(...batch);
    if (batch.length < 100) break;
  }
  const byName = new Map(own.map((r) => [r.full_name.toLowerCase(), r]));
  const info = (repo: string): RepoInfo | undefined => {
    const r = byName.get(repo.toLowerCase());
    return r ? { created: r.created_at.slice(0, 10), pushed: r.pushed_at.slice(0, 10), stars: r.stargazers_count } : undefined;
  };

  const stars: Record<string, RepoInfo> = {};
  for (const e of scratchIndex) {
    const i = info(e.repo);
    if (i) stars[e.repo] = i;
  }
  for (const c of caseStudies) {
    const repo = c.links.map((l) => l.href.match(/github\.com\/(sdivyanshu90\/[\w.-]+)/i)?.[1]).find(Boolean);
    const i = repo ? info(repo) : undefined;
    // Case studies without a public repo date from their year.
    stars[c.id] = i ?? { created: `${c.year.slice(0, 4)}-01-01`, pushed: `${c.year.slice(0, 4)}-01-01`, stars: 0 };
  }
  // Upstream: the date of his first PR to each project. The search API is
  // slow without a token (10/min), so tokenless builds reuse the snapshot.
  const previous = (() => {
    try {
      return JSON.parse(readFileSync(new URL("../src/data/activity.json", import.meta.url), "utf8")).stars as Record<string, RepoInfo>;
    } catch {
      return {} as Record<string, RepoInfo>;
    }
  })();
  for (const o of openSource.filter((x) => x.role !== "Author")) {
    if (!process.env.GITHUB_TOKEN) {
      if (previous[`oss:${o.name}`]) stars[`oss:${o.name}`] = previous[`oss:${o.name}`];
      continue;
    }
    const repo = o.href.match(/github\.com\/([\w.-]+\/[\w.-]+)\/pulls/)?.[1];
    if (!repo) continue;
    const q = encodeURIComponent(`repo:${repo} author:${github.user} type:pr`);
    const first = await get<{ items: { created_at: string; updated_at: string }[] }>(
      `search/issues?q=${q}&sort=created&order=asc&per_page=1`,
    );
    const last = await get<{ items: { updated_at: string }[] }>(`search/issues?q=${q}&sort=updated&order=desc&per_page=1`);
    if (first.items[0]) {
      stars[`oss:${o.name}`] = {
        created: first.items[0].created_at.slice(0, 10),
        pushed: (last.items[0]?.updated_at ?? first.items[0].updated_at).slice(0, 10),
        stars: 0,
      };
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  const out = { generatedAt: new Date().toISOString().slice(0, 10), stars };
  writeFileSync(new URL("../src/data/activity.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
  console.log(`activity: ${Object.keys(stars).length} stars synced`);
} catch (e) {
  console.warn(`activity: GitHub unreachable (${(e as Error).message}) — keeping the committed snapshot`);
}
