import { safely } from "@/lib/db";
import type { StoredRun } from "@/lib/protocol";
import type { Store } from "@/lib/store";

/**
 * Shared runs behind /r/<id>. Neon keeps them permanently; a Redis/KV store
 * keeps them 90 days; with neither, runs aren't persisted and sharing falls
 * back to a re-ask link.
 */

const RUN_TTL_SEC = 90 * 24 * 60 * 60;

export const newRunId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 10);

export function canPersist(store: Store): boolean {
  return !!(process.env.DATABASE_URL ?? process.env.NeonDB_URI) || store.kind === "redis";
}

export async function saveRun(store: Store, id: string, run: StoredRun): Promise<boolean> {
  const ok = await safely((sql) =>
    sql.query("INSERT INTO div1_runs (id, payload) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [id, JSON.stringify(run)]),
  );
  if (ok) return true;
  if (store.kind !== "redis") return false;
  await store.set(`div1:run:${id}`, JSON.stringify(run), RUN_TTL_SEC);
  return true;
}

export async function loadRun(store: Store, id: string): Promise<StoredRun | null> {
  if (!/^[a-f0-9]{10}$/.test(id)) return null;
  const rows = await safely((sql) => sql.query("SELECT payload FROM div1_runs WHERE id = $1", [id]));
  if (rows?.[0]) return rows[0].payload as StoredRun;
  const raw = await store.get(`div1:run:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredRun;
  } catch {
    return null;
  }
}
