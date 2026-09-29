import { safely } from "@/lib/db";
import { getStore } from "@/lib/store";
import { overLimit, visitorId } from "@/lib/visitor";

/** UI events worth learning from. Only these names are accepted. */
const EVENTS = new Set([
  "mode",
  "share",
  "sky",
  "xray",
  "followup",
  "fit",
  "voice",
  "brief",
  "page",
  "contact",
  "resume",
  "cv_print",
]);

export async function POST(req: Request): Promise<Response> {
  const visitor = await visitorId(req);
  if (await overLimit(getStore(), "event", visitor, 60)) return new Response(null, { status: 204 });
  let body: { name?: unknown; detail?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 204 });
  }
  const name = typeof body.name === "string" && EVENTS.has(body.name) ? body.name : null;
  if (!name) return new Response(null, { status: 204 });
  const detail = body.detail && typeof body.detail === "object" ? JSON.stringify(body.detail).slice(0, 500) : null;
  await safely((sql) =>
    sql.query("INSERT INTO div1_events (visitor, name, detail) VALUES ($1, $2, $3::jsonb)", [visitor, name, detail]),
  );
  if (name === "fit") {
    // Fit checks get their own table: counts only, the JD never leaves the browser.
    const d = body.detail as Record<string, unknown>;
    const n = (k: string) => Math.max(0, Math.min(1000, Math.floor(Number(d?.[k]) || 0)));
    await safely((sql) =>
      sql.query("INSERT INTO div1_fit_checks (visitor, requirements, strong, partial, gap) VALUES ($1, $2, $3, $4, $5)", [
        visitor,
        n("requirements"),
        n("strong"),
        n("partial"),
        n("gap"),
      ]),
    );
  }
  return new Response(null, { status: 204 });
}
