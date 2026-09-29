import type { Store } from "@/lib/store";

/** Visitors are identified by a salted hash prefix, never a stored IP. */
export async function visitorId(req: Pick<Request, "headers">): Promise<string> {
  // Smoke tests (authenticated with the admin token) are tagged so their
  // rows can be told apart from real visitors and cleaned up.
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers.get("x-div1-smoke") === token) return "smoke-test";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const data = new TextEncoder().encode(`${process.env.IP_SALT ?? "div1"}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Fixed-window limit per visitor per minute for a named bucket. */
export async function overLimit(store: Store, bucket: string, visitor: string, perMinute: number): Promise<boolean> {
  if (visitor === "smoke-test") return false; // admin-authenticated smoke runs
  const minute = Math.floor(Date.now() / 60_000);
  return (await store.incr(`div1:rl:${bucket}:${visitor}:${minute}`, 70)) > perMinute;
}
