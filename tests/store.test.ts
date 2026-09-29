import { describe, expect, it, vi } from "vitest";
import { MemoryStore, RedisStore } from "@/lib/store";
import { MISSES_KEY, record, redact, RUNS_KEY, summarize } from "@/lib/telemetry";

describe("MemoryStore", () => {
  it("expires values and counters", async () => {
    let now = 0;
    const s = new MemoryStore(() => now);
    await s.set("k", "v", 10);
    expect(await s.incr("c", 10)).toBe(1);
    expect(await s.incr("c", 10)).toBe(2);
    now = 11_000;
    expect(await s.get("k")).toBeNull();
    expect(await s.incr("c", 10)).toBe(1);
  });
  it("caps lists newest-first", async () => {
    const s = new MemoryStore();
    for (const v of ["a", "b", "c"]) await s.push("l", v, 2);
    expect(await s.list("l", 10)).toEqual(["c", "b"]);
  });
});

describe("RedisStore", () => {
  it("speaks the Upstash pipeline protocol", async () => {
    const calls: unknown[] = [];
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      calls.push(JSON.parse(String(init?.body)));
      return Response.json([{ result: "OK" }, { result: 3 }]);
    }) as unknown as typeof fetch;
    const s = new RedisStore("https://kv.example", "t", new MemoryStore(), fetcher);
    expect(await s.incr("rl:x", 70)).toBe(3);
    expect(calls[0]).toEqual([
      ["SET", "rl:x", 0, "EX", 70, "NX"],
      ["INCR", "rl:x"],
    ]);
  });
  it("fails open to memory when Redis is down", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    const s = new RedisStore("https://kv.example", "t", new MemoryStore(), fetcher);
    await s.set("k", "v", 60);
    expect(await s.get("k")).toBe("v");
  });
});

describe("telemetry", () => {
  it("redacts contact details from logged questions", () => {
    expect(redact("mail me at a.b@c.io or +91 98765 43210, see https://x.y/z")).toBe(
      "mail me at [email] or [number], see [url]",
    );
  });
  it("records misses separately and groups them", async () => {
    const s = new MemoryStore();
    const base = { mode: "recruiter", path: "deterministic" as const, kinds: ["about"], retrieved: [], ms: 1 };
    await record(s, { ...base, at: "2026-09-28T01", q: "Does he know Kubernetes?", miss: true, absent: ["Kubernetes"] });
    await record(s, { ...base, at: "2026-09-28T02", q: "does he know kubernetes", miss: true });
    await record(s, { ...base, at: "2026-09-28T03", q: "What is his stack?", miss: false });
    expect(await s.list(RUNS_KEY, 10)).toHaveLength(3);
    const misses = summarize(await s.list(MISSES_KEY, 10));
    expect(misses).toHaveLength(1);
    expect(misses[0].count).toBe(2);
  });
});

describe("rate limit", () => {
  it("allows N per minute per visitor, then refuses", async () => {
    const { overLimit } = await import("@/lib/visitor");
    const s = new MemoryStore();
    const results = [];
    for (let i = 0; i < 13; i++) results.push(await overLimit(s, "ask", "v1", 12));
    expect(results.slice(0, 12).every((r) => r === false)).toBe(true);
    expect(results[12]).toBe(true);
    expect(await overLimit(s, "ask", "v2", 12)).toBe(false); // other visitors unaffected
  });
});
