import { describe, expect, it } from "vitest";
import { POST as handoff } from "@/app/api/handoff/route";
import { POST as feedback } from "@/app/api/feedback/route";
import { plan } from "@/lib/intents";
import { MemoryStore, PostgresStore } from "@/lib/store";
import { unverifiedFigures } from "@/lib/tripwire";
import { splitSentences, xray } from "@/lib/xray";

describe("sentence x-ray", () => {
  it("never splits inside a decimal", () => {
    expect(splitSentences("Cut LCP from 3.3s to 0.7s. Then shipped.")).toEqual(["Cut LCP from 3.3s to 0.7s.", "Then shipped."]);
  });
  it("supports dossier-backed sentences and flags invented ones", () => {
    const [real, fake] = xray(
      "He resolved 40+ critical vulnerabilities at Uniiq and cut LCP from 3.3s to 0.7s. He enjoys long walks on the beach.",
    );
    expect(real.supported).toBe(true);
    expect(real.source?.url).toMatch(/^https:\/\//);
    expect(fake.supported).toBe(false);
  });
});

describe("number tripwire", () => {
  it("passes figures the dossier states", () => {
    expect(unverifiedFigures("88.08% ChestMNIST accuracy, 40+ vulnerabilities, 1,199 lines of tests, Sharpe 1.8")).toEqual([]);
  });
  it("flags invented figures but not years or small counts", () => {
    expect(unverifiedFigures("He hit 92% accuracy in 2024 across 3 projects")).toEqual(["92%"]);
  });
});

describe("easter eggs", () => {
  it("git log renders the changelog as commits", () => {
    const p = plan("git log --author=divanshu");
    expect(p.fallback).toMatch(/^commit v3\.0 \(HEAD -> main\)/);
    expect(p.deterministic).toBe(true);
  });
  it("man divanshu is honest about bugs", () => {
    expect(plan("man divanshu").fallback).toMatch(/Kubernetes is not on record/);
  });
});

describe("PostgresStore", () => {
  it("uses an upsert that resets expired counters", async () => {
    const seen: string[] = [];
    const sql = async (q: string) => {
      seen.push(q);
      return [{ value: "3" }];
    };
    const s = new PostgresStore(sql);
    expect(await s.incr("rl:x", 70)).toBe(3);
    expect(seen.at(-1)).toMatch(/ON CONFLICT \(key\) DO UPDATE/);
    expect(seen.at(-1)).toMatch(/expires_at <= now\(\) THEN '1'/);
  });
  it("fails open to memory when the database errors", async () => {
    const s = new PostgresStore(async () => {
      throw new Error("down");
    }, new MemoryStore());
    await s.set("k", "v", 60);
    expect(await s.get("k")).toBe("v");
    expect(await s.incr("c", 60)).toBe(1);
  });
});

const post = (fn: (r: Request) => Promise<Response>, body: unknown) =>
  fn(new Request("http://local/x", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": `10.1.1.${Math.floor(Math.random() * 250)}` }, body: JSON.stringify(body) }));

describe("interaction endpoints validate input", () => {
  it("handoff rejects a missing question and a malformed contact", async () => {
    expect((await post(handoff, { question: "" })).status).toBe(400);
    expect((await post(handoff, { question: "Does he know Go?", contact: "not a contact" })).status).toBe(400);
  });
  it("handoff accepts an email or URL contact (no database here → ok:false, still 200)", async () => {
    const res = await post(handoff, { question: "Does he know Go?", contact: "a@b.co" });
    expect(res.status).toBe(200);
  });
  it("feedback requires a valid verdict", async () => {
    expect((await post(feedback, { question: "x", verdict: "meh" })).status).toBe(400);
    expect((await post(feedback, { question: "What is his stack?", verdict: "missed" })).status).toBe(200);
  });
});

describe("x-ray signposts", () => {
  it("does not flag pointers to the cards", () => {
    expect(xray("Full figure below.")[0].supported).toBe(true);
  });
});

describe("handoff email", () => {
  it("says plainly it came from the portfolio, escapes visitor text, and replies to the visitor", async () => {
    const { handoffEmail } = await import("@/lib/notify");
    const e = handoffEmail({
      question: "Does he know <script>alert(1)</script> Go?",
      contact: "recruiter@example.com",
      note: "Role: <b>ML</b>",
      at: new Date("2026-09-29T06:15:00Z"),
    });
    expect(e.subject).toMatch(/^\[Portfolio · div90\.vercel\.app\] New question from a visitor/);
    expect(e.html).toContain("SENT FROM YOUR PORTFOLIO");
    expect(e.text).toMatch(/^SENT FROM YOUR PORTFOLIO — https:\/\/div90\.vercel\.app/);
    expect(e.html).not.toContain("<script>");
    expect(e.html).toContain("&lt;script&gt;");
    expect(e.replyTo).toBe("recruiter@example.com");
    expect(handoffEmail({ question: "q?", contact: "https://linkedin.com/in/x", at: new Date() }).replyTo).toBeUndefined();
  });

  it("does nothing without a key", async () => {
    const { notifyHandoff } = await import("@/lib/notify");
    const prev = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    expect(await notifyHandoff({ question: "q", at: new Date() })).toEqual({ sent: false, error: "RESEND_API_KEY not set" });
    if (prev) process.env.RESEND_API_KEY = prev;
  });
});
