import { safely } from "@/lib/db";
import { notifyHandoff } from "@/lib/notify";
import { getStore, type Store } from "@/lib/store";
import { redact } from "@/lib/telemetry";
import { overLimit, visitorId } from "@/lib/visitor";

/** Emails per UTC day across all visitors; past it, rows are still stored. */
const EMAILS_PER_DAY = Number(process.env.HANDOFF_EMAILS_PER_DAY) || 30;
/** Handoffs per visitor per UTC day. */
const PER_VISITOR_PER_DAY = 10;

/**
 * Inbox protection: a rotating-IP flood can't bury real leads or burn the
 * Resend quota. Repeats of the same question + contact email once a day.
 */
async function shouldEmail(store: Store, question: string, contact: string): Promise<{ ok: boolean; why?: string }> {
  const day = new Date().toISOString().slice(0, 10);
  const ttl = 2 * 24 * 60 * 60;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${question.toLowerCase()}|${contact.toLowerCase()}`));
  const fp = Buffer.from(digest).toString("hex").slice(0, 16);
  if ((await store.incr(`div1:handoff:dup:${day}:${fp}`, ttl)) > 1) return { ok: false, why: "duplicate (email skipped)" };
  if ((await store.incr(`div1:handoff:mail:${day}`, ttl)) > EMAILS_PER_DAY) return { ok: false, why: "daily email cap reached (stored only)" };
  return { ok: true };
}

/**
 * "Ask Divanshu": a question DIV-1 couldn't answer goes to him, with an
 * optional way to reply. The contact is kept only because the visitor typed
 * it in order to get an answer; the question itself is redacted. Divanshu
 * is emailed immediately (lib/notify) — the database row is the durable copy.
 */
export async function POST(req: Request): Promise<Response> {
  const store = getStore();
  const visitor = await visitorId(req);
  if (await overLimit(store, "handoff", visitor, 3)) return Response.json({ ok: false }, { status: 429 });
  if (visitor !== "smoke-test") {
    const day = new Date().toISOString().slice(0, 10);
    if ((await store.incr(`div1:handoff:v:${visitor}:${day}`, 2 * 24 * 60 * 60)) > PER_VISITOR_PER_DAY) {
      return Response.json({ ok: false }, { status: 429 });
    }
  }
  let body: { question?: unknown; contact?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const question = typeof body.question === "string" ? redact(body.question.trim()) : "";
  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 200) : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
  if (!question || question.length < 3) return Response.json({ ok: false, error: "question required" }, { status: 400 });
  if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$|^https?:\/\/\S+$/.test(contact)) {
    return Response.json({ ok: false, error: "contact must be an email or a URL" }, { status: 400 });
  }
  const smokeSkip = visitor === "smoke-test" && req.headers.get("x-div1-smoke-email") !== "1";
  const gate = smokeSkip ? { ok: false, why: "smoke test (email skipped)" } : await shouldEmail(store, question, contact);
  const [stored, mail] = await Promise.all([
    safely((sql) =>
      sql.query("INSERT INTO div1_handoffs (visitor, question, contact, note) VALUES ($1, $2, $3, $4)", [
        visitor,
        question,
        contact || null,
        note || null,
      ]),
    ),
    // Smoke tests don't email Divanshu unless they explicitly opt in.
    gate.ok ? notifyHandoff({ question, contact, note, at: new Date() }) : Promise.resolve({ sent: false, error: gate.why }),
  ]);
  if (!mail.sent) console.warn("[handoff] email not sent:", mail.error);
  // Delivered if either the inbox or the database has it.
  return Response.json({ ok: !!stored || mail.sent });
}
