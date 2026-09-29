import { site } from "@/data/portfolio";
import { type Plan, plan, systemPrompt } from "@/lib/intents";
import { PRESET_ANSWERS } from "@/lib/preset-answers";
import type { ConsoleEvent, Mode, StoredRun } from "@/lib/protocol";
import { snapshot, staleFacts } from "@/lib/facts";
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

/** Queries per visitor per minute. */
const RATE_PER_MIN = 12;

/** Finished narrations replay for a day: repeats and shared links are free. */
const CACHE_TTL_SEC = 24 * 60 * 60;


const MODES: Mode[] = ["recruiter", "engineer", "founder"];

/** Public display name for a model — provider prefixes and tier suffixes stay internal. */
const displayModel = (m: string) =>
  m.split("/").pop()?.replace(/:[a-z]+$/i, "") ?? "model";

const cacheKey = (q: string, mode: Mode) =>
  `div1:ans:${mode}|${q.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()}`;

async function throttled(store: Store, visitor: string): Promise<boolean> {
  return overLimit(store, "ask", visitor, RATE_PER_MIN);
}

async function takeNarrationSlot(store: Store): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  return (await store.incr(`div1:spend:${day}`, 2 * 24 * 60 * 60)) <= DAILY_CAP;
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
  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, e: ConsoleEvent) => {
    if (e.t === "trace") kept.trace.push({ step: e.step, detail: e.detail });
    else if (e.t === "artifact") kept.artifacts.push(e.spec);
    else if (e.t === "delta") kept.narration += e.text;
    controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
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
        const key = cacheKey(q, mode);
        const cachedRaw = await store.get(key);
        const cached = cachedRaw
          ? (JSON.parse(cachedRaw) as { text: string; model: string; facts?: typeof kept.facts })
          : null;
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
          apiKey && (await takeNarrationSlot(store))
            ? await hedgedNarration(
                [...(process.env.OPENROUTER_MODEL ? [process.env.OPENROUTER_MODEL] : []), ...FALLBACK_MODELS],
                apiKey,
                systemPrompt(p, mode),
                q,
                started,
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
          for (;;) {
            if (live.first.closed) {
              live.reader.cancel().catch(() => {});
              break;
            }
            const { done: end, value } = await live.reader.read();
            if (end) break;
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
      } catch {
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
        }).catch(() => {});
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
