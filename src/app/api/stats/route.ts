import { safely } from "@/lib/db";

/**
 * Public, aggregate-only numbers for the system card: how many questions
 * DIV-1 has answered and how many injection attempts it sealed. Cached.
 */
// Dynamic (never prerendered at build); the CDN caches it for 5 minutes.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const rows = await safely((sql) =>
    sql.query(
      `SELECT count(*)::int AS questions,
              count(*) FILTER (WHERE path = 'guarded')::int AS sealed,
              count(*) FILTER (WHERE path IN ('preset', 'cached', 'deterministic'))::int AS free
         FROM div1_interactions
        WHERE visitor IS DISTINCT FROM 'owner' AND visitor IS DISTINCT FROM 'smoke-test'`,
    ),
  );
  const s = rows?.[0] as { questions: number; sealed: number; free: number } | undefined;
  return Response.json(s ?? null, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
