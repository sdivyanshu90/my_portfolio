/** Coarse, non-identifying client facts: bot or not, and a browser family. */

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|monitor|curl|wget|python-requests|axios|node-fetch|go-http/i;

export const isBot = (ua: string | null) => !ua || BOT.test(ua);

export function browserFamily(ua: string | null): string {
  if (!ua) return "other";
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "other";
}

export function deviceFromWidth(w: unknown): string {
  const n = Number(w);
  if (!Number.isFinite(n) || n <= 0) return "unknown";
  return n < 640 ? "mobile" : n < 1024 ? "tablet" : "desktop";
}
