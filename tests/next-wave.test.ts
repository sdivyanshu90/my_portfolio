import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as card } from "@/app/api/card.svg/route";
import { fingerprint, snapshot, staleFacts } from "@/lib/facts";
import { interviewQuestions, matchRequirements } from "@/lib/fit";
import { plan } from "@/lib/intents";

describe("epistemic cache — facts", () => {
  it("fingerprints are stable", () => {
    expect(fingerprint("abc")).toBe(fingerprint("abc"));
    expect(fingerprint("abc")).not.toBe(fingerprint("abd"));
  });
  it("answers record the facts they relied on", () => {
    const p = plan("Tell me about the Hindi speech recognition project");
    expect(p.facts).toContain("case:indic-asr");
  });
  it("a snapshot is fresh until a fact changes", () => {
    const snap = snapshot(["case:indic-asr", "repo:sdivyanshu90/Transformer-from-Scratch"]);
    expect(staleFacts(snap)).toEqual([]);
    const tampered = snap.map((f, i) => (i === 0 ? { ...f, hash: "00000000", text: "old text" } : f));
    const stale = staleFacts(tampered);
    expect(stale).toHaveLength(1);
    expect(stale[0].before).toBe("old text");
    expect(stale[0].after).toBeTruthy();
    expect(staleFacts([{ id: "case:gone", hash: "x", label: "Gone", text: "t" }])[0].after).toBeNull();
  });
});

describe("interview prep", () => {
  it("turns strong matches into deep-dive questions with a place to read first", () => {
    const qs = interviewQuestions(matchRequirements("- LLM inference serving: batching, KV cache\n- Kubernetes"));
    expect(qs.length).toBeGreaterThan(0);
    expect(qs[0].q).toMatch(/\?$/);
    expect(qs[0].url).toMatch(/^https:\/\//);
  });
});

describe("README card", () => {
  it("renders an SVG, light and dark", async () => {
    const light = await card(new Request("http://x/api/card.svg")).text();
    const dark = await card(new Request("http://x/api/card.svg?theme=dark")).text();
    expect(light).toMatch(/^<svg/);
    expect(light).toContain("#faf7f0");
    expect(dark).toContain("#14161a");
    expect(light).toContain("merged upstream PRs");
  });
});

describe("/api/ask — epistemic cache invalidation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("OPENROUTER_API_KEY", "k");
    vi.stubEnv("OPENROUTER_MODEL", "paid/primary");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("re-narrates only when a fact the cached answer relied on changed", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_u: string, init?: RequestInit) => {
        calls.push(JSON.parse(String(init?.body)).model);
        const enc = new TextEncoder();
        return new Response(
          new ReadableStream({
            start(c) {
              c.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: "Fresh." } }] })}\n\ndata: [DONE]\n\n`));
              c.close();
            },
          }),
        );
      }),
    );
    const { POST } = await import("@/app/api/ask/route");
    const { getStore } = await import("@/lib/store");
    const q = "What's his experience with Hugging Face in research?";
    const ask = async () =>
      (await (await POST(new Request("http://l/api/ask", { method: "POST", body: JSON.stringify({ question: q, mode: "engineer" }), headers: { "x-forwarded-for": "10.7.7.7" } }))).text())
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l));

    await ask(); // pays once, caches with fact fingerprints
    await ask(); // facts unchanged → cache hit, no call
    expect(calls).toHaveLength(1);

    // Simulate a dossier edit: corrupt one fact fingerprint in the cached entry.
    const store = getStore();
    const key = `div1:ans:engineer|${q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()}`;
    const entry = JSON.parse((await store.get(key))!);
    entry.facts[0].hash = "00000000";
    await store.set(key, JSON.stringify(entry), 60);

    const third = await ask();
    expect(calls).toHaveLength(2);
    expect(third.some((e) => e.t === "trace" && /cache invalidated · 1 fact changed/.test(e.detail))).toBe(true);
  });
});
