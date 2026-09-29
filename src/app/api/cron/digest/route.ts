import { loadDashboard } from "@/lib/analytics";
import { digestEmail } from "@/lib/digest";
import { sendToDivanshu } from "@/lib/notify";

/**
 * Weekly digest (vercel.json cron: Mondays 03:00 UTC = 08:30 IST). Vercel
 * calls it with `Authorization: Bearer $CRON_SECRET`; ADMIN_TOKEN also works
 * for a manual send.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const auth = req.headers.get("authorization");
  const allowed = [process.env.CRON_SECRET, process.env.ADMIN_TOKEN].filter(Boolean).map((t) => `Bearer ${t}`);
  if (!auth || !allowed.includes(auth)) return new Response("Not found", { status: 404 });
  const d = await loadDashboard(7);
  if (!d) return Response.json({ sent: false, error: "no database" }, { status: 503 });
  const mail = await sendToDivanshu({ ...digestEmail(d), tag: "portfolio_digest" });
  return Response.json(mail, { status: mail.sent ? 200 : 502 });
}
