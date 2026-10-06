import { db } from "@/lib/db";

/**
 * Shared state for /api/ask — answer cache, rate limit, spend cap.
 *
 * Preference order: Upstash Redis / Vercel KV (fastest), then Neon Postgres
 * (the `div1_kv` / `div1_list` tables), then per-instance memory. The first
 * two hold across every serverless instance. Remote failures fail open to
 * memory: a flaky store must never break a run.
 *
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_*)
 *   DATABASE_URL (or NeonDB_URI)
 */

export interface Store {
  readonly kind: "redis" | "postgres" | "memory";
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec: number): Promise<void>;
  /**
   * Increment a counter that expires `ttlSec` after its first increment.
   * `strict` rethrows backend errors instead of falling back to per-instance
   * memory — for counters that guard money, where a reset is worse than a no.
   */
  incr(key: string, ttlSec: number, strict?: boolean): Promise<number>;
  /** Prepend to a capped list (newest first). */
  push(key: string, value: string, max: number): Promise<void>;
  list(key: string, n: number): Promise<string[]>;
}

export class MemoryStore implements Store {
  readonly kind = "memory" as const;
  private values = new Map<string, { v: string; exp: number }>();
  private lists = new Map<string, string[]>();
  private readonly maxKeys = 5_000;

  constructor(private now: () => number = Date.now) {}

  private live(key: string) {
    const e = this.values.get(key);
    if (!e) return null;
    if (e.exp <= this.now()) {
      this.values.delete(key);
      return null;
    }
    return e;
  }

  private evict() {
    if (this.values.size < this.maxKeys) return;
    const oldest = this.values.keys().next().value;
    if (oldest !== undefined) this.values.delete(oldest);
  }

  async get(key: string) {
    return this.live(key)?.v ?? null;
  }

  async set(key: string, value: string, ttlSec: number) {
    this.evict();
    this.values.set(key, { v: value, exp: this.now() + ttlSec * 1000 });
  }

  async incr(key: string, ttlSec: number) {
    const e = this.live(key);
    const n = (e ? Number(e.v) : 0) + 1;
    if (!e) this.evict();
    this.values.set(key, { v: String(n), exp: e?.exp ?? this.now() + ttlSec * 1000 });
    return n;
  }

  async push(key: string, value: string, max: number) {
    const l = this.lists.get(key) ?? [];
    l.unshift(value);
    if (l.length > max) l.length = max;
    this.lists.set(key, l);
  }

  async list(key: string, n: number) {
    return (this.lists.get(key) ?? []).slice(0, n);
  }
}

type Command = (string | number)[];

export class RedisStore implements Store {
  readonly kind = "redis" as const;

  constructor(
    private url: string,
    private token: string,
    private fallback: Store = new MemoryStore(),
    private fetcher: typeof fetch = fetch,
  ) {}

  private async pipeline(cmds: Command[]): Promise<unknown[]> {
    const res = await this.fetcher(`${this.url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) throw new Error(`store HTTP ${res.status}`);
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    return out.map((r) => {
      if (r.error) throw new Error(r.error);
      return r.result;
    });
  }

  async get(key: string) {
    try {
      const [v] = await this.pipeline([["GET", key]]);
      return typeof v === "string" ? v : null;
    } catch {
      return this.fallback.get(key);
    }
  }

  async set(key: string, value: string, ttlSec: number) {
    try {
      await this.pipeline([["SET", key, value, "EX", ttlSec]]);
    } catch {
      await this.fallback.set(key, value, ttlSec);
    }
  }

  async incr(key: string, ttlSec: number, strict = false) {
    try {
      // Create with a TTL only if absent, then count; INCR keeps the TTL.
      const [, n] = await this.pipeline([
        ["SET", key, 0, "EX", ttlSec, "NX"],
        ["INCR", key],
      ]);
      return Number(n);
    } catch (e) {
      if (strict) throw e;
      return this.fallback.incr(key, ttlSec);
    }
  }

  async push(key: string, value: string, max: number) {
    try {
      await this.pipeline([
        ["LPUSH", key, value],
        ["LTRIM", key, 0, max - 1],
      ]);
    } catch {
      await this.fallback.push(key, value, max);
    }
  }

  async list(key: string, n: number) {
    try {
      const [v] = await this.pipeline([["LRANGE", key, 0, n - 1]]);
      return Array.isArray(v) ? (v as string[]) : [];
    } catch {
      return this.fallback.list(key, n);
    }
  }
}

type Sql = (query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

export class PostgresStore implements Store {
  readonly kind = "postgres" as const;

  constructor(
    private sql: Sql,
    private fallback: Store = new MemoryStore(),
  ) {}

  private sweep() {
    // Opportunistic cleanup of expired counters/caches (~1 in 50 writes).
    if (Math.random() < 0.02) this.sql("DELETE FROM div1_kv WHERE expires_at < now()").catch(() => {});
  }

  async get(key: string) {
    try {
      const rows = await this.sql("SELECT value FROM div1_kv WHERE key = $1 AND expires_at > now()", [key]);
      return (rows[0]?.value as string | undefined) ?? null;
    } catch {
      return this.fallback.get(key);
    }
  }

  async set(key: string, value: string, ttlSec: number) {
    try {
      this.sweep();
      await this.sql(
        `INSERT INTO div1_kv (key, value, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at`,
        [key, value, ttlSec],
      );
    } catch {
      await this.fallback.set(key, value, ttlSec);
    }
  }

  async incr(key: string, ttlSec: number, strict = false) {
    try {
      this.sweep();
      const rows = await this.sql(
        `INSERT INTO div1_kv (key, value, expires_at) VALUES ($1, '1', now() + make_interval(secs => $2))
         ON CONFLICT (key) DO UPDATE SET
           value = CASE WHEN div1_kv.expires_at <= now() THEN '1' ELSE (div1_kv.value::bigint + 1)::text END,
           expires_at = CASE WHEN div1_kv.expires_at <= now() THEN EXCLUDED.expires_at ELSE div1_kv.expires_at END
         RETURNING value`,
        [key, ttlSec],
      );
      return Number(rows[0]?.value ?? 1);
    } catch (e) {
      if (strict) throw e;
      return this.fallback.incr(key, ttlSec);
    }
  }

  async push(key: string, value: string, max: number) {
    try {
      await this.sql("INSERT INTO div1_list (key, value) VALUES ($1, $2)", [key, value]);
      if (Math.random() < 0.05) {
        await this.sql(
          `DELETE FROM div1_list WHERE key = $1 AND id < (
             SELECT min(id) FROM (SELECT id FROM div1_list WHERE key = $1 ORDER BY id DESC LIMIT $2) t)`,
          [key, max],
        );
      }
    } catch {
      await this.fallback.push(key, value, max);
    }
  }

  async list(key: string, n: number) {
    try {
      const rows = await this.sql("SELECT value FROM div1_list WHERE key = $1 ORDER BY id DESC LIMIT $2", [key, n]);
      return rows.map((r) => r.value as string);
    } catch {
      return this.fallback.list(key, n);
    }
  }
}

let shared: Store | null = null;

export function getStore(): Store {
  if (shared) return shared;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  const pg = db();
  shared =
    url && token
      ? new RedisStore(url, token)
      : pg
        ? new PostgresStore((q, params) => pg.query(q, params) as Promise<Record<string, unknown>[]>)
        : new MemoryStore();
  return shared;
}
