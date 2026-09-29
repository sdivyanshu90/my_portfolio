"use client";

import { useState } from "react";
import { beacon } from "@/lib/beacon";
import { type Attribution, xray } from "@/lib/xray";

/**
 * The row under a finished answer: x-ray the narration, say whether it
 * helped, and — when DIV-1 had nothing on record — hand the question to
 * Divanshu himself.
 */

const btn =
  "font-mono text-[10px] tracking-wider uppercase transition-colors hover:text-accent disabled:opacity-50";

export function XrayNarration({ text }: { text: string }) {
  const parts: Attribution[] = xray(text);
  return (
    <span>
      {parts.map((a, i) => (
        <span key={i}>
          {a.source && a.supported ? (
            <a
              href={a.source.url}
              title={`supported by: ${a.source.name}`}
              className="underline decoration-accent/50 decoration-dotted underline-offset-4 hover:decoration-accent"
            >
              {a.sentence}
            </a>
          ) : a.supported ? (
            <span>{a.sentence}</span>
          ) : (
            <span
              title="no supporting fact in the dossier — treat as unconfirmed"
              className="underline decoration-accent decoration-wavy underline-offset-4"
            >
              {a.sentence}
            </span>
          )}
          {i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

export function AnswerTools({
  question,
  runId,
  xrayOn,
  onXray,
  miss,
  canXray,
}: {
  question: string;
  runId?: string;
  xrayOn: boolean;
  onXray: (on: boolean) => void;
  miss: boolean;
  canXray: boolean;
}) {
  const [voted, setVoted] = useState<"helpful" | "missed" | null>(null);
  const [handoff, setHandoff] = useState<"closed" | "open" | "sending" | "sent" | "error">(miss ? "open" : "closed");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");

  const vote = (verdict: "helpful" | "missed") => {
    setVoted(verdict);
    void fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, runId, verdict }),
    }).catch(() => {});
    if (verdict === "missed" && handoff === "closed") setHandoff("open");
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandoff("sending");
    try {
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, contact, note }),
      });
      setHandoff((await res.json()).ok ? "sent" : "error");
    } catch {
      setHandoff("error");
    }
  };

  return (
    <div className="mt-4 border-t border-rule-faint pt-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-faint">
        {canXray ? (
          <button
            type="button"
            aria-pressed={xrayOn}
            onClick={() => {
              onXray(!xrayOn);
              if (!xrayOn) beacon("xray");
            }}
            className={`${btn} ${xrayOn ? "text-accent" : ""}`}
            title="Underline each sentence with the dossier fact that supports it"
          >
            {xrayOn ? "◉ x-ray on" : "◎ x-ray"}
          </button>
        ) : null}
        {voted ? (
          <span className="font-mono text-[10px] tracking-wider uppercase">
            {voted === "helpful" ? "✓ thanks" : "✓ logged — it goes on the fix list"}
          </span>
        ) : (
          <>
            <button type="button" onClick={() => vote("helpful")} className={btn}>
              helpful
            </button>
            <button type="button" onClick={() => vote("missed")} className={btn}>
              this missed
            </button>
          </>
        )}
        {handoff === "closed" ? (
          <button type="button" onClick={() => setHandoff("open")} className={`${btn} ml-auto`}>
            ask divanshu directly →
          </button>
        ) : null}
      </div>
      {xrayOn ? (
        <p className="mt-2 font-mono text-[10px] text-ink-faint">
          <span className="underline decoration-accent/50 decoration-dotted underline-offset-2">dotted</span> = supported
          by a dossier fact (click to open) ·{" "}
          <span className="underline decoration-accent decoration-wavy underline-offset-2">wavy</span> = no support found
        </p>
      ) : null}

      {handoff === "open" || handoff === "sending" || handoff === "error" ? (
        <form onSubmit={send} className="mt-3 border border-rule-faint bg-paper/60 p-3">
          <p className="text-[13px] leading-snug text-ink-muted">
            {miss ? "DIV-1 has nothing on record for this. " : ""}Send the question to Divanshu directly. Leave an
            email or LinkedIn if you&apos;d like a reply — it&apos;s only used to answer you.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">Your email or profile URL (optional)</span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={200}
                placeholder="your email or LinkedIn (optional)"
                className="w-full border border-rule bg-surface px-2 py-1.5 font-mono text-[12px] focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="sr-only">Context (optional)</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                placeholder="context, e.g. the role (optional)"
                className="w-full border border-rule bg-surface px-2 py-1.5 font-mono text-[12px] focus:border-accent focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={handoff === "sending"}
              className="border border-accent px-3 py-1 font-mono text-[11px] tracking-wider text-accent uppercase hover:bg-accent hover:text-paper disabled:opacity-50"
            >
              {handoff === "sending" ? "sending…" : "send to divanshu"}
            </button>
            {handoff === "error" ? (
              <span className="font-mono text-[11px] text-accent">couldn&apos;t send — email works too</span>
            ) : null}
          </div>
        </form>
      ) : handoff === "sent" ? (
        <p className="mt-3 font-mono text-[11px] text-accent">
          ✓ received — it&apos;s in Divanshu&apos;s queue{contact ? "; he'll reply to the contact you left" : ""}.
        </p>
      ) : null}
    </div>
  );
}
