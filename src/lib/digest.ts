import { site } from "@/data/portfolio";
import type { Dashboard } from "@/lib/analytics";

/**
 * The Monday digest: last week on the portfolio, from the same queries as
 * /admin, so the email and the dashboard never disagree.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const host = site.url.replace(/^https?:\/\//, "");
const mins = (ms: number) => (ms < 60_000 ? `${Math.round(ms / 1000)}s` : `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`);
const names = new Intl.DisplayNames(["en"], { type: "region" });
const country = (c: string) => (/^[A-Z]{2}$/.test(c) ? (names.of(c) ?? c) : "Unknown");

export function digestEmail(d: Dashboard) {
  const k = d.kpi;
  const change = k.prevVisitors ? Math.round(((k.visitors - k.prevVisitors) / k.prevVisitors) * 100) : null;
  const subject = `[Portfolio · ${host}] Weekly digest: ${k.visitors} visitor${k.visitors === 1 ? "" : "s"}, ${k.questions} question${k.questions === 1 ? "" : "s"}${k.handoffsNew ? `, ${k.handoffsNew} waiting for you` : ""}`;

  const lines: [string, string[]][] = [
    [
      "The week",
      [
        `${k.visitors} unique visitors${change === null ? "" : ` (${change >= 0 ? "+" : ""}${change}% vs the week before)`}, ${k.newVisitors} new`,
        `${k.views} page views · ${k.sessions} sessions · ${mins(k.avgSessionMs)} average engaged time`,
        `${k.questions} questions asked · ${k.contacts} reached out (email / résumé) · $${k.spendUsd.toFixed(4)} model spend`,
      ],
    ],
    ["Countries", d.countries.slice(0, 5).map((c) => `${country(c.code)} — ${c.visitors}`)],
    ["Where they came from", d.referrers.slice(0, 5).map((r) => `${r.source} — ${r.visitors}`)],
    [
      "Waiting for you (Ask Divanshu)",
      d.handoffs.filter((h) => h.status === "new").map((h) => `“${h.question}” — ${h.contact ?? "no contact"}`),
    ],
    ["What DIV-1 couldn't answer", d.misses.slice(0, 5).map((m) => `${m.q}${m.absent ? ` (not on record: ${m.absent})` : ""} ×${m.count}`)],
    ["Most asked", d.exchanges.slice(0, 5).map((x) => x.question)],
  ];
  const kept = lines.filter(([, items]) => items.length);

  const text = [
    `SENT FROM YOUR PORTFOLIO — ${site.url}`,
    "Your weekly digest (last 7 days).",
    "",
    ...kept.flatMap(([title, items]) => [title.toUpperCase(), ...items.map((i) => `- ${i}`), ""]),
    `Full dashboard: ${site.url}/admin`,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#faf7f0;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fffdf7;border:1px solid #ddd5c6">
  <div style="background:#a82f1b;color:#fffdf7;padding:10px 20px;font:12px ui-monospace,Menlo,monospace;letter-spacing:1px">
    SENT FROM YOUR PORTFOLIO · <a href="${site.url}" style="color:#fffdf7">${esc(host)}</a> · WEEKLY DIGEST
  </div>
  <div style="padding:20px">
    <p style="margin:0;font:12px ui-monospace,Menlo,monospace;color:#6e685d">Last 7 days</p>
    <p style="margin:4px 0 18px;font:40px Georgia,serif;color:#1c1a17">${k.visitors} <span style="font-size:15px;color:#57534a">unique visitors${change === null ? "" : ` · ${change >= 0 ? "+" : ""}${change}% vs the week before`}</span></p>
    ${kept
      .map(
        ([title, items]) =>
          `<p style="margin:16px 0 6px;font:11px ui-monospace,Menlo,monospace;letter-spacing:1.5px;color:#6e685d">${esc(title.toUpperCase())}</p>
    <ul style="margin:0;padding-left:18px;font:14px Georgia,serif;color:#1c1a17">${items.map((i) => `<li style="margin:3px 0">${esc(i)}</li>`).join("")}</ul>`,
      )
      .join("\n    ")}
    <p style="margin:22px 0 0"><a href="${site.url}/admin" style="font:12px ui-monospace,Menlo,monospace;color:#a82f1b">Open the full dashboard →</a></p>
  </div>
  <div style="border-top:1px solid #ebe5d8;padding:12px 20px;font:11px ui-monospace,Menlo,monospace;color:#6e685d">
    Sent every Monday by your portfolio, ${esc(host)}.
  </div>
</div></body></html>`;

  return { subject, text, html };
}
