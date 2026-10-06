import { safely } from "@/lib/db";
import { bearerIs } from "@/lib/session";
import { getStore } from "@/lib/store";
import { MISSES_KEY, RUNS_KEY, type RunLog, summarize } from "@/lib/telemetry";

/**
 * The misses inbox: what DIV-1 answered badly, what visitors flagged, and
 * what they asked Divanshu directly — the content backlog, grouped. Private:
 * requires ADMIN_TOKEN (Authorization: Bearer <token>); without it configured
 * the endpoint does not exist. `?days=30` widens the window (default 14).
 */
export async function GET(req: Request): Promise<Response> {
  if (!bearerIs(req.headers.get("authorization"), process.env.ADMIN_TOKEN)) {
    return new Response("Not found", { status: 404 });
  }
  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get("days")) || 14));

  const fromDb = await safely(async (sql) => {
    const [paths, misses, flagged, handoffs, top, fit, conversion, recent] = await Promise.all([
      sql.query(
        "SELECT path, count(*)::int AS n FROM div1_interactions WHERE at > now() - make_interval(days => $1) GROUP BY 1 ORDER BY 2 DESC",
        [days],
      ),
      sql.query(
        `SELECT lower(question) AS q, count(*)::int AS count, max(at) AS last,
                array_agg(DISTINCT path) AS paths,
                (array_agg(array_to_string(absent, ', ') ORDER BY at DESC))[1] AS absent
           FROM div1_interactions WHERE miss AND at > now() - make_interval(days => $1)
          GROUP BY 1 ORDER BY 2 DESC, 3 DESC LIMIT 100`,
        [days],
      ),
      sql.query(
        "SELECT at, question, note, run_id FROM div1_feedback WHERE verdict = 'missed' AND at > now() - make_interval(days => $1) ORDER BY at DESC LIMIT 100",
        [days],
      ),
      sql.query("SELECT id, at, question, contact, note FROM div1_handoffs WHERE status = 'new' ORDER BY at DESC LIMIT 100"),
      sql.query(
        `SELECT lower(question) AS q, count(*)::int AS count FROM div1_interactions
          WHERE at > now() - make_interval(days => $1) GROUP BY 1 ORDER BY 2 DESC LIMIT 25`,
        [days],
      ),
      sql.query(
        `SELECT count(*)::int AS checks, coalesce(sum(gap), 0)::int AS gaps, coalesce(sum(strong), 0)::int AS strong
           FROM div1_fit_checks WHERE at > now() - make_interval(days => $1)`,
        [days],
      ),
      // Conversion: each visitor's first question, and whether they then
      // emailed him or opened the résumé. Orders the presets by what works.
      sql.query(
        `WITH first_q AS (
           SELECT DISTINCT ON (visitor) visitor, lower(question) AS q
             FROM div1_interactions
            WHERE visitor IS NOT NULL AND at > now() - make_interval(days => $1)
            ORDER BY visitor, at
         ), converted AS (
           SELECT DISTINCT visitor FROM div1_events
            WHERE name IN ('contact', 'resume') AND at > now() - make_interval(days => $1)
         )
         SELECT f.q, count(*)::int AS visitors, count(c.visitor)::int AS converted
           FROM first_q f LEFT JOIN converted c USING (visitor)
          GROUP BY 1 ORDER BY 3 DESC, 2 DESC LIMIT 25`,
        [days],
      ),
      // The latest full exchanges — question and what DIV-1 answered.
      sql.query(
        `SELECT at, source, mode, path, question, answer, model, ms, run_id
           FROM div1_interactions WHERE at > now() - make_interval(days => $1)
          ORDER BY at DESC LIMIT 50`,
        [days],
      ),
    ]);
    return {
      store: "postgres",
      days,
      paths,
      misses,
      flagged,
      handoffs,
      topQuestions: top,
      fitChecks: fit[0],
      firstQuestionConversion: conversion,
      recent,
    };
  });
  if (fromDb) return Response.json(fromDb, { headers: { "Cache-Control": "no-store" } });

  // No database: the in-memory/Redis lists from telemetry.
  const store = getStore();
  const [misses, runs] = await Promise.all([store.list(MISSES_KEY, 500), store.list(RUNS_KEY, 2_000)]);
  const paths: Record<string, number> = {};
  for (const raw of runs) {
    try {
      const r = JSON.parse(raw) as RunLog;
      paths[r.path] = (paths[r.path] ?? 0) + 1;
    } catch {
      /* skip malformed */
    }
  }
  return Response.json(
    { store: store.kind, runs: runs.length, paths, misses: summarize(misses) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
