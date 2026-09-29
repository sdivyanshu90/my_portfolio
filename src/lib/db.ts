import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon Postgres over HTTP — one round trip per query, no pool, which suits
 * serverless functions. Reads DATABASE_URL (Vercel's Neon integration) or
 * NeonDB_URI. Without either, everything that uses it degrades to memory.
 */

let client: NeonQueryFunction<false, false> | null | undefined;

export function db(): NeonQueryFunction<false, false> | null {
  if (client !== undefined) return client;
  const url = process.env.DATABASE_URL ?? process.env.NeonDB_URI;
  client = url ? neon(url) : null;
  return client;
}

/** Run a statement, never throwing: telemetry must not break a request. */
export async function safely<T>(fn: (sql: NeonQueryFunction<false, false>) => Promise<T>): Promise<T | null> {
  const sql = db();
  if (!sql) return null;
  try {
    return await fn(sql);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.warn("[db]", (e as Error).message);
    return null;
  }
}
