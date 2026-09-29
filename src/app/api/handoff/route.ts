import { safely } from "@/lib/db";
import { notifyHandoff } from "@/lib/notify";
import { getStore } from "@/lib/store";
import { redact } from "@/lib/telemetry";
import { overLimit, visitorId } from "@/lib/visitor";

/**
 * "Ask Divanshu": a question DIV-1 couldn't answer goes to him, with an
 * optional way to reply. The contact is kept only because the visitor typed
 * it in order to get an answer; the question itself is redacted. Divanshu
 * is emailed immediately (lib/notify) — the database row is the durable copy.
 */
export async function POST(req: Request): Promise<Response> {
  const visitor = await visitorId(req);
  if (await overLimit(getStore(), "handoff", visitor, 3)) return Response.json({ ok: false }, { status: 429 });
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
    visitor === "smoke-test" && req.headers.get("x-div1-smoke-email") !== "1"
      ? Promise.resolve({ sent: false, error: "smoke test (email skipped)" })
      : notifyHandoff({ question, contact, note, at: new Date() }),
  ]);
  if (!mail.sent) console.warn("[handoff] email not sent:", mail.error);
  // Delivered if either the inbox or the database has it.
  return Response.json({ ok: !!stored || mail.sent });
}
