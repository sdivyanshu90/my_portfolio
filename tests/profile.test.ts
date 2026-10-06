import { describe, expect, it } from "vitest";
import { caseStudies, counts, keyResults, personal, principles } from "@/data/portfolio";
import { posts, publishedPosts } from "@/data/writing";
import { digestEmail } from "@/lib/digest";
import type { Dashboard } from "@/lib/analytics";
import { bearerIs, mintSession, validSession, visitorSalt } from "@/lib/session";
import { isOwner, visitorId } from "@/lib/visitor";
import { createHash } from "node:crypto";

describe("profile content", () => {
  it("leads with the focused positioning", () => {
    expect(personal.lead).toBe("Applied AI / ML Systems Engineer");
    expect(personal.focus).toMatch(/evaluation, inference & reliability/);
  });
  it("derives the upstream key result from verified data", () => {
    const upstream = keyResults.find((k) => k.label === "merged upstream PRs");
    expect(upstream?.value).toBe(counts.mergedUpstream);
  });
  it("gives every case study a diagram and a receipt", () => {
    for (const c of caseStudies) {
      expect(c.diagram, c.id).toBeDefined();
      expect(c.source.label.length, c.id).toBeGreaterThan(3);
    }
  });
  it("backs every principle with evidence", () => {
    for (const p of principles) expect(p.evidence.href).toMatch(/^(https:\/\/|\/)/);
  });
});

describe("writing", () => {
  it("keeps drafts unpublished until Divanshu flips them", () => {
    expect(posts.length).toBeGreaterThan(0);
    expect(publishedPosts().every((p) => p.published)).toBe(true);
  });
});

describe("owner visits", () => {
  it("tags a request carrying the admin session cookie as the owner", async () => {
    process.env.ADMIN_TOKEN = "t0k";
    const cookie = `div1_admin=${mintSession("t0k")}`;
    const req = new Request("http://x/", { headers: { cookie: `a=1; ${cookie}` } });
    expect(isOwner(req)).toBe(true);
    expect(await visitorId(req)).toBe("owner");
    expect(isOwner(new Request("http://x/", { headers: { cookie: "div1_admin=forged" } }))).toBe(false);
    // The old static cookie (a bare hash of the token) no longer works.
    const legacy = `div1_admin=${createHash("sha256").update("div1-admin:t0k").digest("hex")}`;
    expect(isOwner(new Request("http://x/", { headers: { cookie: legacy } }))).toBe(false);
    delete process.env.ADMIN_TOKEN;
  });
});

describe("admin sessions and secrets", () => {
  it("expires sessions and rejects a session signed with another token", () => {
    const now = Date.UTC(2026, 9, 6);
    const s = mintSession("t0k", now);
    expect(validSession(s, "t0k", now)).toBe(true);
    expect(validSession(s, "t0k", now + 8 * 24 * 3600 * 1000)).toBe(false);
    expect(validSession(s, "other", now)).toBe(false);
    const [exp, mac] = s.split(".");
    expect(validSession(`${Number(exp) + 999999}.${mac}`, "t0k", now)).toBe(false);
  });

  it("compares bearer secrets exactly", () => {
    expect(bearerIs("Bearer abc", "abc")).toBe(true);
    expect(bearerIs("Bearer abc", undefined, "abc")).toBe(true);
    expect(bearerIs("Bearer ab", "abc")).toBe(false);
    expect(bearerIs("abc", "abc")).toBe(false);
    expect(bearerIs(null, "abc")).toBe(false);
    expect(bearerIs("Bearer ", undefined)).toBe(false);
  });

  it("never hashes visitors with a public default salt when a server secret exists", () => {
    const saved = { salt: process.env.IP_SALT, token: process.env.ADMIN_TOKEN };
    delete process.env.IP_SALT;
    process.env.ADMIN_TOKEN = "t0k";
    expect(visitorSalt()).not.toBe("div1");
    expect(visitorSalt()).toMatch(/^[0-9a-f]{64}$/);
    process.env.IP_SALT = "explicit";
    expect(visitorSalt()).toBe("explicit");
    if (saved.salt === undefined) delete process.env.IP_SALT;
    else process.env.IP_SALT = saved.salt;
    if (saved.token === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = saved.token;
  });
});

describe("weekly digest", () => {
  const d = {
    days: 7,
    kpi: { visitors: 12, prevVisitors: 8, views: 40, prevViews: 20, sessions: 15, avgSessionMs: 95_000, pagesPerSession: 2.7, newVisitors: 9, questions: 22, contacts: 3, handoffsNew: 1, spendUsd: 0.0021 },
    weekly: [], countries: [{ code: "IN", visitors: 7 }, { code: "US", visitors: 3 }], timeBuckets: [], pages: [],
    referrers: [{ source: "linkedin.com", visitors: 5 }], devices: [], browsers: [], sources: [], paths: [],
    exchanges: [{ at: "", source: "console", path: "preset", question: "What is his stack?", answer: "…", model: null, ms: 1, cost_usd: null, run_id: null }],
    misses: [{ q: "does he know kubernetes?", count: 2, absent: "Kubernetes" }], flagged: [],
    handoffs: [{ id: "1", at: "", question: "Open to relocation?", contact: "hr@x.co", note: null, status: "new" }],
    conversion: [], fit: { checks: 0, strong: 0, gaps: 0 },
  } satisfies Dashboard;
  it("says where it's from and summarizes the week", () => {
    const e = digestEmail(d);
    expect(e.subject).toMatch(/^\[Portfolio · div90\.vercel\.app\] Weekly digest: 12 visitors, 22 questions, 1 waiting for you$/);
    expect(e.text).toMatch(/^SENT FROM YOUR PORTFOLIO/);
    expect(e.text).toContain("+50% vs the week before");
    expect(e.text).toContain("India — 7");
    expect(e.text).toContain("“Open to relocation?” — hr@x.co");
    expect(e.html).not.toContain("<script");
  });
});
