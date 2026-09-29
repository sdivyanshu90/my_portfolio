import { safely } from "@/lib/db";
import { getStore } from "@/lib/store";
import { redact } from "@/lib/telemetry";
import { overLimit, visitorId } from "@/lib/visitor";

/** "This answer missed" / "helpful" — feeds the misses inbox and, once fixed, the golden set. */
export async function POST(req: Request): Promise<Response> {
  const visitor = await visitorId(req);
  if (await overLimit(getStore(), "feedback", visitor, 10)) return Response.json({ ok: false }, { status: 429 });
  let body: { runId?: unknown; question?: unknown; verdict?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const verdict = body.verdict === "missed" || body.verdict === "helpful" ? body.verdict : null;
  const question = typeof body.question === "string" ? redact(body.question.trim()) : "";
  if (!verdict || !question) return Response.json({ ok: false }, { status: 400 });
  const runId = typeof body.runId === "string" && /^[a-f0-9]{10}$/.test(body.runId) ? body.runId : null;
  const note = typeof body.note === "string" ? redact(body.note.trim()).slice(0, 500) : null;
  const ok = await safely((sql) =>
    sql.query("INSERT INTO div1_feedback (visitor, run_id, question, verdict, note) VALUES ($1, $2, $3, $4, $5)", [
      visitor,
      runId,
      question,
      verdict,
      note,
    ]),
  );
  return Response.json({ ok: !!ok });
}
