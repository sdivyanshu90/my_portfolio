import { personal, site } from "@/data/portfolio";

/**
 * Email Divanshu the moment a visitor uses "Ask Divanshu" on the portfolio,
 * via Resend (https://resend.com). The subject and a banner make the origin
 * unmistakable; when the visitor left an email, Reply goes straight to them.
 *
 *   RESEND_API_KEY   required to send
 *   NOTIFY_EMAIL     where alerts go (default: the dossier email)
 *   NOTIFY_FROM      sender (default: Resend's onboarding address, which can
 *                    only deliver to the Resend account's own email — fine
 *                    for alerts to yourself; set a verified domain later)
 */

export interface Handoff {
  question: string;
  contact?: string | null;
  note?: string | null;
  at: Date;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const host = site.url.replace(/^https?:\/\//, "");

export function handoffEmail(h: Handoff) {
  const oneLine = h.question.replace(/\s+/g, " ").trim();
  const short = oneLine.length > 70 ? `${oneLine.slice(0, 67)}…` : oneLine;
  const when = h.at.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const replyTo = h.contact && EMAIL.test(h.contact) ? h.contact : undefined;

  const subject = `[Portfolio · ${host}] New question from a visitor: “${short}”`;

  const text = [
    `SENT FROM YOUR PORTFOLIO — ${site.url}`,
    `A visitor used "Ask Divanshu" on your portfolio (DIV-1).`,
    "",
    `Question: ${oneLine}`,
    `Contact:  ${h.contact || "not provided"}`,
    `Context:  ${h.note || "not provided"}`,
    `Received: ${when} IST`,
    "",
    replyTo ? `Reply to this email to answer them directly (${replyTo}).` : "They left no email — reply via the contact above, if any.",
    "",
    `— DIV-1 · ${site.url}`,
    "You're receiving this because a visitor submitted the \"Ask Divanshu\" form on your portfolio.",
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6e685d;font:12px ui-monospace,Menlo,monospace;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#1c1a17;font:15px Georgia,serif">${value}</td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;background:#faf7f0;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fffdf7;border:1px solid #ddd5c6">
  <div style="background:#a82f1b;color:#fffdf7;padding:10px 20px;font:12px ui-monospace,Menlo,monospace;letter-spacing:1px">
    SENT FROM YOUR PORTFOLIO · <a href="${site.url}" style="color:#fffdf7">${esc(host)}</a>
  </div>
  <div style="padding:20px">
    <p style="margin:0 0 4px;font:12px ui-monospace,Menlo,monospace;color:#6e685d;letter-spacing:1px">DIV-1 · ASK DIVANSHU</p>
    <p style="margin:0 0 16px;font:15px Georgia,serif;color:#57534a">A visitor asked a question on your portfolio.</p>
    <p style="margin:0 0 18px;font:italic 20px Georgia,serif;color:#1c1a17">“${esc(oneLine)}”</p>
    <table style="border-collapse:collapse">
      ${row("contact", h.contact ? esc(h.contact) : '<span style="color:#6e685d">not provided</span>')}
      ${row("context", h.note ? esc(h.note) : '<span style="color:#6e685d">not provided</span>')}
      ${row("received", `${esc(when)} IST`)}
    </table>
    <p style="margin:18px 0 0;font:14px Georgia,serif;color:#57534a">${
      replyTo
        ? `Press <b>Reply</b> to answer them directly at ${esc(replyTo)}.`
        : "They didn't leave an email address — reply via the contact above, if any."
    }</p>
  </div>
  <div style="border-top:1px solid #ebe5d8;padding:12px 20px;font:11px ui-monospace,Menlo,monospace;color:#6e685d">
    You're receiving this because a visitor submitted the “Ask Divanshu” form on your portfolio,
    <a href="${site.url}" style="color:#a82f1b">${esc(host)}</a>.
  </div>
</div></body></html>`;

  return { subject, text, html, replyTo };
}

export interface Email {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  tag: string;
}

/** Send an email to Divanshu via Resend. Never throws. */
export async function sendToDivanshu({ subject, text, html, replyTo, tag }: Email): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "DIV-1 Portfolio <onboarding@resend.dev>",
        to: [process.env.NOTIFY_EMAIL ?? personal.email],
        subject,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        tags: [{ name: "source", value: tag }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return { sent: true };
    return { sent: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
  } catch (e) {
    return { sent: false, error: (e as Error).message };
  }
}

/** Send the "Ask Divanshu" alert. Never throws; returns whether Resend accepted it. */
export async function notifyHandoff(h: Handoff): Promise<{ sent: boolean; error?: string }> {
  return sendToDivanshu({ ...handoffEmail(h), tag: "portfolio_handoff" });
}
