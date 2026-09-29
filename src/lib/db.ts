import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon Postgres over HTTP — one round trip per query, no pool, which suits
 * serverless functions. NeonDB_URI (set deliberately) wins over DATABASE_URL
 * (which Vercel's Neon integration injects, pointing at its own database).
 * Without either, everything that uses it degrades to memory.
 */

let client: NeonQueryFunction<false, false> | null | undefined;

/**
 * Forgive the common paste mistakes in a dashboard env var: surrounding
 * quotes and a trailing "# comment" (dotenv strips those; Vercel keeps them).
 */
export function cleanUrl(v: string): string {
  return v
    .trim()
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^(["'])(.*)\1$/, "$2");
}

function source(): { name: "NeonDB_URI" | "DATABASE_URL"; url: string } | null {
  if (process.env.NeonDB_URI) return { name: "NeonDB_URI", url: process.env.NeonDB_URI };
  if (process.env.DATABASE_URL) return { name: "DATABASE_URL", url: process.env.DATABASE_URL };
  return null;
}

export function db(): NeonQueryFunction<false, false> | null {
  if (client !== undefined) return client;
  const s = source();
  try {
    client = s ? neon(cleanUrl(s.url)) : null;
  } catch {
    client = null; // malformed URL: behave as unconfigured, /admin explains
  }
  return client;
}

/** Which variable and host are in use — for /admin diagnostics (no credentials). */
export function dbInfo(): { variable: string | null; host: string | null; both: boolean; problem: string | null } {
  const s = source();
  const both = !!process.env.NeonDB_URI && !!process.env.DATABASE_URL;
  if (!s) return { variable: null, host: null, both, problem: null };
  let host: string | null = null;
  let problem: string | null = null;
  try {
    const u = new URL(cleanUrl(s.url));
    host = u.hostname;
    if (!/^postgres(ql)?:$/.test(u.protocol)) problem = `scheme is "${u.protocol}", expected postgresql:`;
  } catch {
    problem = "the value isn't a valid URL";
  }
  if (cleanUrl(s.url) !== s.url.trim()) {
    problem = "the value had a comment or quotes around it — they're ignored now, but tidy it to just the postgresql:// URL";
  }
  return { variable: s.name, host, both, problem };
}

/** Run a statement, never throwing: telemetry must not break a request. */
export async function safely<T>(fn: (sql: NeonQueryFunction<false, false>) => Promise<T>): Promise<T | null> {
  const sql = db();
  if (!sql) return null;
  try {
    return await fn(sql);
  } catch (e) {
    console.warn("[db]", (e as Error).message);
    return null;
  }
}
