import { safely } from "@/lib/db";

/**
 * How often visitors asked about each star over the last 90 days — the sky
 * glows by demand. Aggregate counts only; cached at the CDN for 10 minutes.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const rows = await safely((sql) =>
    sql.query(
      `SELECT e AS id, count(*)::int AS n
         FROM div1_interactions, unnest(entities) AS e
        WHERE at > now() - interval '90 days' AND path <> 'guarded'
          AND visitor IS DISTINCT FROM 'owner' AND visitor IS DISTINCT FROM 'smoke-test'
        GROUP BY 1`,
    ),
  );
  const demand = Object.fromEntries((rows ?? []).map((r) => [r.id as string, r.n as number]));
  return Response.json(demand, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } });
}
