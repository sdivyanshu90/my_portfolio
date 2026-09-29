import { safely } from "@/lib/db";
import type { Store } from "@/lib/store";

/**
 * What visitors ask, and where DIV-1 fell short. The misses list is the
 * content backlog: every question it answered with the generic card, a
 * "not on record", or a quarantine is something to add or fix.
 *
 * Privacy: no IPs or user agents are stored; emails, phone numbers and URLs
 * in a question are redacted before logging.
 */

export type RunPath = "preset" | "cached" | "model" | "deterministic" | "guarded" | "mcp";

/** Where a question came from: the site's console, a direct API call, or an AI agent over MCP. */
export type RunSource = "console" | "api" | "mcp";

export interface RunLog {
  at: string;
  q: string;
  mode: string;
  path: RunPath;
  kinds: string[];
  retrieved: string[];
  absent?: string[];
  miss: boolean;
  ms: number;
  visitor?: string;
  model?: string | null;
  tokens?: number | null;
  costUsd?: number | null;
  runId?: string;
  hasPrev?: boolean;
  entities?: string[];
  source?: RunSource;
  /** What DIV-1 answered (narration, or a tool-result summary for MCP). */
  answer?: string;
  /** The cards shown and the run's trace. */
  artifacts?: unknown;
  trace?: unknown;
  sources?: string[];
}

export const RUNS_KEY = "div1:runs";
export const MISSES_KEY = "div1:misses";

export function redact(q: string): string {
  return q
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[number]")
    .slice(0, 280);
}

export async function record(store: Store, log: RunLog): Promise<void> {
  const q = redact(log.q);
  // Neon, when configured, is the durable record of every interaction.
  const stored = await safely((sql) =>
    sql.query(
      `INSERT INTO div1_interactions
         (visitor, question, mode, path, kinds, retrieved, absent, miss, ms, model, tokens, cost_usd, run_id, has_prev, entities,
          source, answer, artifacts, trace, sources)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
               $16, $17, $18::jsonb, $19::jsonb, $20)`,
      [
        log.visitor ?? null,
        q,
        log.mode,
        log.path,
        log.kinds,
        log.retrieved,
        log.absent ?? [],
        log.miss,
        log.ms,
        log.model ?? null,
        log.tokens ?? null,
        log.costUsd ?? null,
        log.runId ?? null,
        log.hasPrev ?? false,
        (log.entities ?? []).slice(0, 12),
        log.source ?? "console",
        log.answer ? log.answer.slice(0, 8000) : null,
        log.artifacts === undefined ? null : JSON.stringify(log.artifacts),
        log.trace === undefined ? null : JSON.stringify(log.trace),
        log.sources ?? [],
      ],
    ),
  );
  if (stored) return;
  const entry = JSON.stringify({ ...log, q });
  await store.push(RUNS_KEY, entry, 2_000);
  if (log.miss) await store.push(MISSES_KEY, entry, 500);
}

export interface MissSummary {
  q: string;
  count: number;
  last: string;
  kinds: string[];
  absent?: string[];
  path: RunPath;
}

/** Group misses by normalized question, most frequent first. */
export function summarize(entries: string[]): MissSummary[] {
  const by = new Map<string, MissSummary>();
  for (const raw of entries) {
    let e: RunLog;
    try {
      e = JSON.parse(raw) as RunLog;
    } catch {
      continue;
    }
    const key = e.q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const cur = by.get(key);
    if (cur) {
      cur.count++;
      if (e.at > cur.last) cur.last = e.at;
    } else {
      by.set(key, { q: e.q, count: 1, last: e.at, kinds: e.kinds, absent: e.absent, path: e.path });
    }
  }
  return [...by.values()].sort((a, b) => b.count - a.count || b.last.localeCompare(a.last));
}
