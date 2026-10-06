import { site } from "@/data/portfolio";
import { type Plan, plan, systemPrompt } from "@/lib/intents";
import { PRESET_ANSWERS } from "@/lib/preset-answers";
import type { ConsoleEvent, Mode, StoredRun } from "@/lib/protocol";
import { snapshot, staleFacts } from "@/lib/facts";
import { sendToDivanshu } from "@/lib/notify";
import { canPersist, newRunId, saveRun } from "@/lib/runs";
import { getStore, type Store } from "@/lib/store";
import { type RunPath, record } from "@/lib/telemetry";
import { unverifiedFigures } from "@/lib/tripwire";
import { overLimit, visitorId } from "@/lib/visitor";

export const maxDuration = 60;

/** Free-tier models rate-limit unpredictably — the fallback chain. */
const FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-20b:free",
];

/** A candidate must produce its first data token within this window. */
const FIRST_TOKEN_TIMEOUT_MS = 12_000;

/**
 * Hedging: if the leading model is still silent after this long, the next
 * candidate starts in parallel and the first token wins. The paid primary
 * always goes first; hedges only ever add free fallbacks.
 */
const HEDGE_MS = Number(process.env.NARRATION_HEDGE_MS) || 4_000;

/** No new candidates start once this much of the run has elapsed. */
const CHAIN_BUDGET_MS = 18_000;

/**
 * Spend guard for paid models: narrations per UTC day (override with
 * NARRATION_DAILY_CAP). Past it, runs are deterministic — the artifacts are
 * exact either way. Shared across instances when a Redis store is configured.
 */
const DAILY_CAP = Number(process.env.NARRATION_DAILY_CAP) || 300;

/**
 * Paid narrations per visitor per UTC day: one visitor asking unique
 * questions can't spend the whole day's budget for everyone else.
 */
const VISITOR_DAILY_CAP = Number(process.env.NARRATION_VISITOR_CAP) || 25;

/** Queries per visitor per minute. */
const RATE_PER_MIN = 12;

/** Finished narrations replay for a day: repeats and shared links are free. */
const CACHE_TTL_SEC = 24 * 60 * 60;


const MODES: Mode[] = ["recruiter", "engineer", "founder"];

/** Public display name for a model — provider prefixes and tier suffixes stay internal. */
const displayModel = (m: string) =>
  m.split("/").pop()?.replace(/:[a-z]+$/i, "") ?? "model";

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/**
 * A follow-on ("and the tests?") is answered in light of the question before
 * it, so that question is part of the key — otherwise the first visitor's
 * context would be replayed to everyone who types the same short phrase.
 */
const cacheKey = (q: string, mode: Mode, followOn?: string) =>
  `div1:ans:${mode}|${norm(q)}${followOn ? ` ‖ ${norm(followOn)}` : ""}`;

function readCached(raw: string | null): { text: string; model: string; facts?: StoredRun["facts"] } | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { text?: unknown; model?: unknown; facts?: StoredRun["facts"] };
    return typeof v.text === "string" && v.text.trim() && typeof v.model === "string"
      ? { text: v.text, model: v.model, facts: v.facts }
      : null;
  } catch {
    return null; // A corrupt entry is a miss, never an empty answer.
  }
}

async function throttled(store: Store, visitor: string): Promise<boolean> {
  return overLimit(store, "ask", visitor, RATE_PER_MIN);
}

/** Budget alerts: one email the first time the day's spend crosses each mark. */
const ALERT_AT = [0.5, 0.9];

/**
 * Take one paid narration from today's budget. Counters are strict: if the
 * store can't count, the answer is deterministic — a per-instance memory
 * fallback would silently reset the cap on every cold start.
 */
async function takeNarrationSlot(store: Store, visitor: string): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const ttl = 2 * 24 * 60 * 60;
  try {
    if (visitor !== "smoke-test" && (await store.incr(`div1:spend:v:${visitor}:${day}`, ttl, true)) > VISITOR_DAILY_CAP) {
      return false;
    }
    const n = await store.incr(`div1:spend:${day}`, ttl, true);
    const mark = ALERT_AT.find((f) => n === Math.ceil(DAILY_CAP * f));
    if (mark) await budgetAlert(day, n, mark);
    return n <= DAILY_CAP;
  } catch (e) {
    console.warn("[ask] spend counter unavailable — narrating deterministically", (e as Error).message);
    return false;
  }
}

async function budgetAlert(day: string, n: number, mark: number) {
  const pct = Math.round(mark * 100);
  // Every line is built from constants and counters — nothing visitor-supplied.
  const lines = [
    `Sent from your portfolio (${site.url}).`,
    "",
    `${n} of ${DAILY_CAP} paid narrations used on ${day} (UTC).`,
    "Past the cap the console answers deterministically — the cards stay exact, only the prose stops.",
    "If this is unexpected, check /admin for a single visitor or a burst of unique questions.",
  ];
  const res = await sendToDivanshu({
    subject: `[DIV-1 portfolio] ${pct}% of today's narration budget used`,
    text: lines.join("\n"),
    html: `<p>${lines.join("<br>")}</p>`,
    tag: "portfolio_budget",
  });
  if (!res.sent) console.warn("[ask] budget alert not sent", res.error);
}

interface Usage {
  tokens: number;
  costUsd: number | null;
}

/** Extract streamed text deltas (and the final usage chunk) from OpenRouter SSE lines. */
function parseSse(lines: string[]): { text: string; done: boolean; closed: boolean; usage?: Usage } {
  let text = "";
  let done = false;
  let closed = false;
  let usage: Usage | undefined;
  for (const line of lines) {
    const data = line.startsWith("data: ") ? line.slice(6).trim() : null;
    if (!data) continue;
    if (data === "[DONE]") {
      done = true;
      closed = true;
      continue;
    }
    try {
      const delta: unknown = JSON.parse(data);
      const chunk = delta as {
        choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
        usage?: { total_tokens?: number; cost?: number };
      };
      const choice = chunk.choices?.[0];
      if (choice?.delta?.content) text += choice.delta.content;
      if (choice?.finish_reason) done = true;
      if (chunk.usage?.total_tokens) {
        usage = { tokens: chunk.usage.total_tokens, costUsd: typeof chunk.usage.cost === "number" ? chunk.usage.cost : null };
      }
    } catch {
      // Partial/keep-alive line — skip.
    }
  }
  return { text, done, closed, usage };
}

interface LiveStream {
  model: string;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  firstText: string;
  buffer: string;
  /** What the first chunk already contained — a short answer can finish in it. */
  first: { done: boolean; closed: boolean; usage?: Usage };
}

/**
 * Try one model. Succeeds only if it yields an actual first data token
 * within the deadline — free-tier endpoints often accept the connection,
 * send keep-alive comments, and then hang. `signal` lets a hedge race
 * abort the losers.
 */
async function tryModel(
  model: string,
  apiKey: string,
  system: string,
  question: string,
  signal: AbortSignal,
): Promise<LiveStream | null> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, FIRST_TOKEN_TIMEOUT_MS);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": site.url,
        "X-Title": "DIV-1 console",
      },
      body: JSON.stringify({
        model,
        stream: true,
        // Budget: low reasoning effort, never streamed back; the cap
        // covers reasoning + a 120-word narration with headroom.
        max_tokens: 700,
        reasoning: { effort: "low", exclude: true },
        // Final chunk carries token count and cost: the answer's receipt.
        usage: { include: true },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Visitor query about Divanshu: "${question}"` },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      res.body?.cancel().catch(() => {});
      return null;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return null; // Stream ended without content.
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      const parsed = parseSse(lines);
      if (parsed.text) {
        return {
          model,
          reader,
          firstText: parsed.text,
          buffer,
          first: { done: parsed.done, closed: parsed.closed, usage: parsed.usage },
        };
      }
    }
  } catch {
    return null; // Timeout, hedge abort, or network error.
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

/**
 * Staggered race: start the first candidate; each time one fails, or the
 * current leader stays silent for HEDGE_MS, start the next. First token wins
 * and every other attempt is aborted.
 */
function hedgedNarration(
  candidates: string[],
  apiKey: string,
  system: string,
  question: string,
  started: number,
  gone: AbortSignal,
): Promise<LiveStream | null> {
  return new Promise((resolve) => {
    const controllers: AbortController[] = [];
    let settled = false;
    let pending = 0;
    let next = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (live: LiveStream | null, winner = -1) => {
      if (settled) {
        live?.reader.cancel().catch(() => {});
        return;
      }
      settled = true;
      clearTimeout(timer);
      controllers.forEach((c, i) => i !== winner && c.abort());
      resolve(live);
    };

    const launch = () => {
      clearTimeout(timer);
      if (settled) return;
      if (next >= candidates.length || Date.now() - started > CHAIN_BUDGET_MS) {
        if (pending === 0) finish(null);
        return;
      }
      const i = next++;
      controllers[i] = new AbortController();
      pending++;
      tryModel(candidates[i], apiKey, system, question, controllers[i].signal).then((live) => {
        pending--;
        if (live) finish(live, i);
        else launch();
      });
      timer = setTimeout(launch, HEDGE_MS);
    };

    // The visitor left: abort every attempt — nobody is reading the answer.
    if (gone.aborted) return finish(null);
    gone.addEventListener("abort", () => finish(null), { once: true });
    launch();
  });
}

export async function POST(req: Request): Promise<Response> {
  const store = getStore();
  const visitor = await visitorId(req);
  if (await throttled(store, visitor)) {
    return Response.json({ error: "Too many queries — take a breath" }, { status: 429 });
  }

  let question: unknown;
  let mode: Mode = "recruiter";
  let prev: string | undefined;
  try {
    const body = (await req.json()) as { question?: unknown; mode?: unknown; prev?: unknown };
    // (question, mode, prev) are validated below; nothing else is read.
    question = body.question;
    if (typeof body.mode === "string" && MODES.includes(body.mode as Mode)) {
      mode = body.mode as Mode;
    }
    if (typeof body.prev === "string" && body.prev.trim()) prev = body.prev.trim().slice(0, 280);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof question !== "string" || !question.trim() || question.length > 500) {
    return Response.json({ error: "Invalid question" }, { status: 400 });
  }
  const q = question.trim();
  const started = Date.now();
  const p: Plan = plan(q, mode, prev);
  const apiKey = process.env.OPENROUTER_API_KEY;

  const encoder = new TextEncoder();
  // Everything emitted is also kept, so a finished run can be persisted.
  const kept: StoredRun = {
    q,
    mode,
    at: new Date().toISOString(),
    trace: [],
    artifacts: [],
    narration: "",
    sources: p.sources,
    model: null,
    ms: 0,
    followUps: p.followUps,
    facts: snapshot(p.facts),
  };
  // Fires when the visitor disconnects (tab closed, superseded question):
  // the paid stream is cancelled instead of running on for nobody.
  const gone = new AbortController();
  req.signal?.addEventListener("abort", () => gone.abort(), { once: true });
  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, e: ConsoleEvent) => {
    if (e.t === "trace") kept.trace.push({ step: e.step, detail: e.detail });
    else if (e.t === "artifact") kept.artifacts.push(e.spec);
    else if (e.t === "delta") kept.narration += e.text;
    else if (e.t === "note") kept.notes = [...(kept.notes ?? []), e.text];
    if (gone.signal.aborted) return;
    try {
      controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
    } catch {
      gone.abort(); // The client is gone; keep recording, stop sending.
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let path: RunPath = "deterministic";
      let model: string | null = null;
      let usage: Usage | undefined;
      let id: string | undefined;
      const done = async () => {
        const ms = Date.now() - started;
        if (canPersist(store) && !p.guarded && kept.narration) {
          const candidate = newRunId();
          if (await saveRun(store, candidate, { ...kept, model, ms, usage })) id = candidate;
        }
        emit(controller, {
          t: "done",
          ms,
          model,
          sources: p.sources,
          followUps: p.followUps,
          runId: id,
          usage,
          miss: p.freeform || !!p.absence,
        });
      };
      const tools = () => {
        for (const a of p.artifacts) {
          const arg =
            a.params?.ids?.join(",") ??
            a.params?.highlight?.map((r) => r.split("/")[1]).slice(0, 3).join(",") ??
            a.params?.layer ??
            "";
          emit(controller, { t: "trace", step: "tool", detail: `get_${a.kind}(${arg})` });
          emit(controller, { t: "artifact", spec: a });
        }
      };

      try {
        // 0 — Injection screen: the directive is dropped and never reaches a
        // model; anything else the query asked about Divanshu still renders.
        if (p.guarded) {
          path = "guarded";
          emit(controller, { t: "trace", step: "guardrail", detail: "directive ignored · narration sealed" });
          tools();
          emit(controller, { t: "trace", step: "synthesis", detail: "sealed" });
          emit(controller, { t: "delta", text: p.fallback });
          await done();
          return;
        }

        // 1 — Deterministic plan: instant, works with every model offline.
        const sudo = /sudo\s+hire/i.test(q);
        emit(controller, {
          t: "trace",
          step: "intent",
          detail: p.intents.join(" + ") + (sudo ? " (sudo)" : ""),
        });
        if (p.retrieved.length) {
          const more = p.retrieved.length > 3 ? ` +${p.retrieved.length - 3}` : "";
          emit(controller, { t: "trace", step: "retrieve", detail: p.retrieved.slice(0, 3).join(" · ") + more });
        }
        if (p.absence) {
          emit(controller, { t: "trace", step: "retrieve", detail: `not on record: ${p.absence.missing.join(", ")}` });
        }
        if (sudo) {
          emit(controller, { t: "note", text: "privilege escalation approved — hiring interface unlocked." });
        }
        tools();

        // 2a — Preset fast path: the most-travelled queries answer instantly
        // from pre-written, dossier-grounded narration. No model involved.
        const preset = PRESET_ANSWERS[q];
        if (preset) {
          path = "preset";
          model = "cached";
          emit(controller, { t: "trace", step: "synthesis", detail: "cached" });
          emit(controller, { t: "delta", text: preset });
          await done();
          return;
        }

        // 2b — Deterministic by design: honest absences, canonical chips, and
        // questions about the console itself. The fallback is the answer.
        const systemOnly = p.intents.length === 1 && p.intents[0] === "system";
        if (p.deterministic || systemOnly) {
          emit(controller, { t: "trace", step: "synthesis", detail: "deterministic" });
          emit(controller, { t: "delta", text: p.fallback });
          await done();
          return;
        }

        // 2c — A narration someone already paid for.
        const key = cacheKey(q, mode, p.followOn);
        const cached = readCached(await store.get(key));
        // Epistemic cache: a narration survives only while every fact it
        // relied on is unchanged — invalidation is per fact, not global.
        const changed = cached ? staleFacts(cached.facts) : [];
        if (cached && changed.length) {
          emit(controller, {
            t: "trace",
            step: "synthesis",
            detail: `cache invalidated · ${changed.length} fact${changed.length > 1 ? "s" : ""} changed (${changed.map((c) => c.label).slice(0, 2).join(", ")})`,
          });
        }
        if (cached && !changed.length) {
          const hit = cached;
          path = "cached";
          model = "cached";
          emit(controller, { t: "trace", step: "synthesis", detail: `${hit.model} · cached` });
          emit(controller, { t: "delta", text: hit.text });
          await done();
          return;
        }

        // 2d — Live narration: hedged model race, else handwritten fallback.
        const live =
          apiKey && !gone.signal.aborted && (await takeNarrationSlot(store, visitor))
            ? await hedgedNarration(
                [...(process.env.OPENROUTER_MODEL ? [process.env.OPENROUTER_MODEL] : []), ...FALLBACK_MODELS],
                apiKey,
                systemPrompt(p, mode),
                q,
                started,
                gone.signal,
              )
            : null;

        if (live) {
          path = "model";
          model = displayModel(live.model);
          emit(controller, { t: "trace", step: "synthesis", detail: model });
          emit(controller, { t: "delta", text: live.firstText });
          let narration = live.firstText;
          let finished = live.first.done;
          if (live.first.usage) usage = live.first.usage;
          const decoder = new TextDecoder();
          let buffer = live.buffer;
          const stop = () => live.reader.cancel().catch(() => {});
          gone.signal.addEventListener("abort", stop, { once: true });
          for (;;) {
            if (live.first.closed || gone.signal.aborted) {
              live.reader.cancel().catch(() => {});
              break;
            }
            const { done: end, value } = await live.reader.read().catch(() => ({ done: true, value: undefined }));
            if (end || !value) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            const parsed = parseSse(lines);
            if (parsed.usage) usage = parsed.usage;
            if (parsed.text) {
              narration += parsed.text;
              emit(controller, { t: "delta", text: parsed.text });
            }
            if (parsed.done) finished = true;
            // Keep reading past finish_reason: the usage chunk follows it.
            if (parsed.closed || buffer.trim() === "data: [DONE]") {
              live.reader.cancel().catch(() => {});
              break;
            }
          }
          // Number tripwire: a figure the dossier never states is flagged
          // on the card and keeps this narration out of the cache.
          const suspect = unverifiedFigures(narration);
          if (suspect.length) {
            emit(controller, { t: "trace", step: "guardrail", detail: `tripwire: ${suspect.length} unverified figure${suspect.length > 1 ? "s" : ""}` });
            emit(controller, {
              t: "note",
              text: `unverified figure${suspect.length > 1 ? "s" : ""} in this narration: ${suspect.join(", ")} — not in his dossier; treat as unconfirmed. The cards below are exact.`,
            });
          }
          gone.signal.removeEventListener("abort", stop);
          if (suspect.length) kept.suspect = suspect;
          // Only complete, clean narrations are worth replaying.
          if (finished && narration.trim() && !suspect.length) {
            await store.set(key, JSON.stringify({ text: narration, model, facts: kept.facts }), CACHE_TTL_SEC);
          }
        } else {
          emit(controller, { t: "trace", step: "synthesis", detail: "deterministic" });
          emit(controller, { t: "delta", text: p.fallback });
          if (apiKey) {
            emit(controller, {
              t: "note",
              text: "narration is running in deterministic mode right now — the artifacts above are exact and complete.",
            });
          }
        }
        await done();
      } catch (e) {
        console.warn("[ask] run failed — closing with what was sent", (e as Error)?.message);
        // Ensure the client always gets closure.
        try {
          await done();
        } catch {
          /* controller already closed */
        }
      } finally {
        await record(store, {
          at: new Date().toISOString(),
          q,
          mode,
          path,
          kinds: p.intents,
          retrieved: p.retrieved,
          absent: p.absence?.missing,
          miss: p.freeform || p.guarded || !!p.absence,
          ms: Date.now() - started,
          visitor,
          model,
          tokens: usage?.tokens ?? null,
          costUsd: usage?.costUsd ?? null,
          runId: id,
          hasPrev: !!prev,
          entities: p.guarded ? [] : p.entities,
          // The full exchange: the answer as streamed, cards, trace, sources.
          source: req.headers.get("x-div1-client") === "console" ? "console" : "api",
          answer: kept.narration,
          artifacts: kept.artifacts,
          trace: kept.trace,
          sources: p.sources,
        }).catch((e) => console.warn("[ask] interaction not recorded", (e as Error)?.message));
        try {
          controller.close();
        } catch {
          /* already closed or cancelled */
        }
      }
    },
    cancel() {
      gone.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
