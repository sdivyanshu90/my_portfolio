import { safely } from "@/lib/db";
import { getStore } from "@/lib/store";
import { browserFamily, deviceFromWidth, isBot } from "@/lib/ua";
import { overLimit, visitorId } from "@/lib/visitor";

/**
 * Page-view collection for the /admin analytics. Two beacons per view:
 *   {kind: "view", id, session, path, ref, w, utm}  — when a page is shown
 *   {kind: "time", id, ms}                          — engaged time so far
 * Stores no IP and no user agent; country comes from the CDN's geo header.
 */

const ID = /^[a-z0-9-]{8,64}$/i;

export async function POST(req: Request): Promise<Response> {
  const ua = req.headers.get("user-agent");
  const visitor = await visitorId(req);
  if (visitor !== "smoke-test" && isBot(ua)) return new Response(null, { status: 204 });
  if (await overLimit(getStore(), "pv", visitor, 120)) return new Response(null, { status: 204 });

  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 204 });
  }
  const id = typeof b.id === "string" && ID.test(b.id) ? b.id : null;
  if (!id) return new Response(null, { status: 204 });

  if (b.kind === "time") {
    // Engaged time only grows; capped at 2h per view. Keyed by the view's
    // random id alone: the visitor hash can change mid-visit (Wi-Fi → mobile
    // data), and the last beacon is sent during unload.
    const ms = Math.max(0, Math.min(7_200_000, Math.floor(Number(b.ms) || 0)));
    await safely((sql) =>
      sql.query("UPDATE div1_pageviews SET duration_ms = GREATEST(duration_ms, $1) WHERE id = $2", [ms, id]),
    );
    return new Response(null, { status: 204 });
  }

  const path = typeof b.path === "string" ? b.path.slice(0, 200).split("?")[0] : "/";
  if (path.startsWith("/admin")) return new Response(null, { status: 204 });
  let referrer: string | null = null;
  try {
    const host = typeof b.ref === "string" && b.ref ? new URL(b.ref).hostname.replace(/^www\./, "") : null;
    const self = new URL(req.url).hostname;
    referrer = host && host !== self ? host.slice(0, 100) : null;
  } catch {
    referrer = null;
  }
  const session = typeof b.session === "string" && ID.test(b.session) ? b.session : null;
  const utm = typeof b.utm === "string" ? b.utm.replace(/[^\w.-]/g, "").slice(0, 60) || null : null;
  const country = (req.headers.get("x-vercel-ip-country") ?? "").toUpperCase().slice(0, 2) || null;

  await safely((sql) =>
    sql.query(
      `INSERT INTO div1_pageviews (id, visitor, session, path, referrer, utm_source, country, device, browser)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
      [id, visitor, session, path, referrer, utm, country, deviceFromWidth(b.w), browserFamily(ua)],
    ),
  );
  return new Response(null, { status: 204 });
}
