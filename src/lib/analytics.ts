import { db } from "@/lib/db";

/**
 * Everything /admin shows, as plain data. One range (in days) scopes every
 * query except the 12-week trend, which is labeled as such.
 */

export interface Dashboard {
  days: number;
  kpi: {
    visitors: number;
    prevVisitors: number;
    views: number;
    prevViews: number;
    sessions: number;
    avgSessionMs: number;
    pagesPerSession: number;
    newVisitors: number;
    questions: number;
    contacts: number;
    handoffsNew: number;
    spendUsd: number;
  };
  weekly: { week: string; visitors: number; views: number }[];
  countries: { code: string; visitors: number }[];
  timeBuckets: { label: string; sessions: number }[];
  pages: { path: string; views: number; avgMs: number }[];
  referrers: { source: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
  browsers: { browser: string; visitors: number }[];
  sources: { source: string; n: number }[];
  paths: { path: string; n: number }[];
  exchanges: {
    at: string;
    source: string;
    path: string;
    question: string;
    answer: string | null;
    model: string | null;
    ms: number;
    cost_usd: string | null;
    run_id: string | null;
  }[];
  misses: { q: string; count: number; absent: string | null }[];
  flagged: { at: string; question: string; note: string | null }[];
  handoffs: { id: string; at: string; question: string; contact: string | null; note: string | null; status: string }[];
  conversion: { q: string; visitors: number; converted: number }[];
  fit: { checks: number; strong: number; gaps: number };
}

const num = (v: unknown) => Number(v ?? 0) || 0;

/** Real visitors only: his own visits ("owner") and smoke tests are left out. */
const REAL = "visitor IS DISTINCT FROM 'owner' AND visitor IS DISTINCT FROM 'smoke-test'";

export async function loadDashboard(days: number): Promise<Dashboard | null> {
  const sql = db();
  if (!sql) return null;
  const q = (text: string, params: unknown[] = []) => sql.query(text, params) as Promise<Record<string, unknown>[]>;
  const range = `at > now() - make_interval(days => $1) AND ${REAL}`;
  const prev = `at <= now() - make_interval(days => $1) AND at > now() - make_interval(days => $1 * 2) AND ${REAL}`;

  const [
    kpiNow,
    kpiPrev,
    sessions,
    newVis,
    weekly,
    countries,
    buckets,
    pages,
    refs,
    devices,
    browsers,
    qKpi,
    contacts,
    handoffsNew,
    sources,
    paths,
    exchanges,
    misses,
    flagged,
    handoffs,
    conversion,
    fit,
  ] = await Promise.all([
    q(`SELECT count(DISTINCT visitor)::int v, count(*)::int n FROM div1_pageviews WHERE ${range}`, [days]),
    q(`SELECT count(DISTINCT visitor)::int v, count(*)::int n FROM div1_pageviews WHERE ${prev}`, [days]),
    q(
      `SELECT count(*)::int s, coalesce(avg(t), 0)::int avg_ms, coalesce(avg(n), 0)::float pps
         FROM (SELECT session, sum(duration_ms) t, count(*) n FROM div1_pageviews
                WHERE ${range} AND session IS NOT NULL GROUP BY session) x`,
      [days],
    ),
    q(
      `SELECT count(*)::int n FROM (
         SELECT visitor, min(at) first FROM div1_pageviews WHERE ${REAL} GROUP BY visitor
       ) f WHERE first > now() - make_interval(days => $1)`,
      [days],
    ),
    q(
      `SELECT to_char(date_trunc('week', at), 'YYYY-MM-DD') w, count(DISTINCT visitor)::int v, count(*)::int n
         FROM div1_pageviews WHERE at > date_trunc('week', now()) - interval '11 weeks' AND ${REAL}
        GROUP BY 1 ORDER BY 1`,
    ),
    q(
      `SELECT coalesce(country, '??') c, count(DISTINCT visitor)::int v FROM div1_pageviews
        WHERE ${range} GROUP BY 1 ORDER BY 2 DESC, 1`,
      [days],
    ),
    q(
      `SELECT CASE WHEN t < 10000 THEN 0 WHEN t < 30000 THEN 1 WHEN t < 120000 THEN 2 WHEN t < 300000 THEN 3 ELSE 4 END b,
              count(*)::int n
         FROM (SELECT session, sum(duration_ms) t FROM div1_pageviews
                WHERE ${range} AND session IS NOT NULL GROUP BY session) x
        GROUP BY 1 ORDER BY 1`,
      [days],
    ),
    q(
      `SELECT path, count(*)::int n, coalesce(avg(duration_ms), 0)::int avg_ms FROM div1_pageviews
        WHERE ${range} GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
      [days],
    ),
    q(
      `SELECT coalesce(utm_source, referrer, 'direct') s, count(DISTINCT visitor)::int v FROM div1_pageviews
        WHERE ${range} GROUP BY 1 ORDER BY 2 DESC LIMIT 12`,
      [days],
    ),
    q(`SELECT coalesce(device, 'unknown') d, count(DISTINCT visitor)::int v FROM div1_pageviews WHERE ${range} GROUP BY 1 ORDER BY 2 DESC`, [days]),
    q(`SELECT coalesce(browser, 'other') b, count(DISTINCT visitor)::int v FROM div1_pageviews WHERE ${range} GROUP BY 1 ORDER BY 2 DESC`, [days]),
    q(
      `SELECT count(*)::int n, coalesce(sum(cost_usd), 0)::float spend FROM div1_interactions
        WHERE ${range}`,
      [days],
    ),
    q(`SELECT count(DISTINCT visitor)::int n FROM div1_events WHERE ${range} AND name IN ('contact', 'resume')`, [days]),
    q(`SELECT count(*)::int n FROM div1_handoffs WHERE status = 'new' AND ${REAL}`),
    q(`SELECT source, count(*)::int n FROM div1_interactions WHERE ${range} GROUP BY 1 ORDER BY 2 DESC`, [days]),
    q(`SELECT path, count(*)::int n FROM div1_interactions WHERE ${range} GROUP BY 1 ORDER BY 2 DESC`, [days]),
    q(
      `SELECT at, source, path, question, answer, model, ms, cost_usd::text, run_id FROM div1_interactions
        WHERE ${range} ORDER BY at DESC LIMIT 60`,
      [days],
    ),
    q(
      `SELECT lower(question) q, count(*)::int count, (array_agg(array_to_string(absent, ', ') ORDER BY at DESC))[1] absent
         FROM div1_interactions WHERE miss AND source <> 'mcp' AND ${range}
        GROUP BY 1 ORDER BY 2 DESC LIMIT 25`,
      [days],
    ),
    q(`SELECT at, question, note FROM div1_feedback WHERE verdict = 'missed' AND ${range} ORDER BY at DESC LIMIT 25`, [days]),
    q(
      `SELECT id::text, at, question, contact, note, status FROM div1_handoffs
        WHERE ${REAL} ORDER BY (status = 'new') DESC, at DESC LIMIT 50`,
    ),
    q(
      `WITH first_q AS (
         SELECT DISTINCT ON (visitor) visitor, lower(question) q FROM div1_interactions
          WHERE visitor IS NOT NULL AND source <> 'mcp' AND ${range} ORDER BY visitor, at
       ), converted AS (
         SELECT DISTINCT visitor FROM div1_events WHERE name IN ('contact', 'resume') AND ${range}
       )
       SELECT f.q, count(*)::int visitors, count(c.visitor)::int converted
         FROM first_q f LEFT JOIN converted c USING (visitor) GROUP BY 1 ORDER BY 3 DESC, 2 DESC LIMIT 15`,
      [days],
    ),
    q(
      `SELECT count(*)::int checks, coalesce(sum(strong), 0)::int strong, coalesce(sum(gap), 0)::int gaps
         FROM div1_fit_checks WHERE ${range}`,
      [days],
    ),
  ]);

  // Fill the 12-week trend so empty weeks show as zero, not as gaps.
  const byWeek = new Map(weekly.map((r) => [String(r.w), r]));
  const monday = new Date();
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() - (11 - i) * 7);
    const key = d.toISOString().slice(0, 10);
    const r = byWeek.get(key);
    return { week: key, visitors: num(r?.v), views: num(r?.n) };
  });

  const BUCKETS = ["under 10s", "10–30s", "30s–2m", "2–5m", "5m+"];
  const bucketCounts = new Map(buckets.map((r) => [num(r.b), num(r.n)]));

  return {
    days,
    kpi: {
      visitors: num(kpiNow[0]?.v),
      prevVisitors: num(kpiPrev[0]?.v),
      views: num(kpiNow[0]?.n),
      prevViews: num(kpiPrev[0]?.n),
      sessions: num(sessions[0]?.s),
      avgSessionMs: num(sessions[0]?.avg_ms),
      pagesPerSession: Math.round(num(sessions[0]?.pps) * 10) / 10,
      newVisitors: num(newVis[0]?.n),
      questions: num(qKpi[0]?.n),
      contacts: num(contacts[0]?.n),
      handoffsNew: num(handoffsNew[0]?.n),
      spendUsd: num(qKpi[0]?.spend),
    },
    weekly: weeks,
    countries: countries.map((r) => ({ code: String(r.c), visitors: num(r.v) })),
    timeBuckets: BUCKETS.map((label, i) => ({ label, sessions: bucketCounts.get(i) ?? 0 })),
    pages: pages.map((r) => ({ path: String(r.path), views: num(r.n), avgMs: num(r.avg_ms) })),
    referrers: refs.map((r) => ({ source: String(r.s), visitors: num(r.v) })),
    devices: devices.map((r) => ({ device: String(r.d), visitors: num(r.v) })),
    browsers: browsers.map((r) => ({ browser: String(r.b), visitors: num(r.v) })),
    sources: sources.map((r) => ({ source: String(r.source), n: num(r.n) })),
    paths: paths.map((r) => ({ path: String(r.path), n: num(r.n) })),
    exchanges: exchanges.map((r) => ({
      at: new Date(String(r.at)).toISOString(),
      source: String(r.source),
      path: String(r.path),
      question: String(r.question),
      answer: (r.answer as string | null) ?? null,
      model: (r.model as string | null) ?? null,
      ms: num(r.ms),
      cost_usd: (r.cost_usd as string | null) ?? null,
      run_id: (r.run_id as string | null) ?? null,
    })),
    misses: misses.map((r) => ({ q: String(r.q), count: num(r.count), absent: (r.absent as string | null) || null })),
    flagged: flagged.map((r) => ({ at: new Date(String(r.at)).toISOString(), question: String(r.question), note: (r.note as string | null) ?? null })),
    handoffs: handoffs.map((r) => ({
      id: String(r.id),
      at: new Date(String(r.at)).toISOString(),
      question: String(r.question),
      contact: (r.contact as string | null) ?? null,
      note: (r.note as string | null) ?? null,
      status: String(r.status),
    })),
    conversion: conversion.map((r) => ({ q: String(r.q), visitors: num(r.visitors), converted: num(r.converted) })),
    fit: { checks: num(fit[0]?.checks), strong: num(fit[0]?.strong), gaps: num(fit[0]?.gaps) },
  };
}

export async function setHandoffStatus(id: string, status: "new" | "answered" | "dismissed"): Promise<void> {
  const sql = db();
  if (!sql || !/^\d+$/.test(id)) return;
  await sql.query("UPDATE div1_handoffs SET status = $1 WHERE id = $2", [status, id]);
}
