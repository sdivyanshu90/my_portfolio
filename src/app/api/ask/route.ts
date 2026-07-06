import { plan, systemPrompt } from "@/lib/intents";
import { PRESET_ANSWERS } from "@/lib/preset-answers";
import type { ConsoleEvent, Mode } from "@/lib/protocol";
import { site } from "@/data/portfolio";

export const maxDuration = 60;

/** Free-tier models rate-limit unpredictably — try each in turn. */
const FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-20b:free",
];

/** A candidate must produce its first data token within this window. */
const FIRST_TOKEN_TIMEOUT_MS = 12_000;

const MODES: Mode[] = ["recruiter", "engineer", "founder"];

/** Public display name for a model — provider prefixes and tier suffixes stay internal. */
const displayModel = (m: string) => m.split("/").pop()?.replace(/:[a-z]+$/i, "") ?? "model";

/** Best-effort per-IP throttle (per serverless instance; cheap insurance). */
const hits = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  if (hits.size > 5_000) hits.clear();
  hits.set(ip, recent);
  return recent.length > 12;
}

/** Extract streamed text deltas from OpenRouter SSE lines. */
function parseSse(lines: string[]): { text: string; done: boolean } {
  let text = "";
  let done = false;
  for (const line of lines) {
    const data = line.startsWith("data: ") ? line.slice(6).trim() : null;
    if (!data) continue;
    if (data === "[DONE]") {
      done = true;
      continue;
    }
    try {
      const delta: unknown = JSON.parse(data);
      const choice = (delta as {
        choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
      }).choices?.[0];
      if (choice?.delta?.content) text += choice.delta.content;
      if (choice?.finish_reason) done = true;
    } catch {
      // Partial/keep-alive line — skip.
    }
  }
  return { text, done };
}

interface LiveStream {
  model: string;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  firstText: string;
  buffer: string;
}

/**
 * Try one model. Succeeds only if it yields an actual first data token
 * within the deadline — free-tier endpoints often accept the connection,
 * send keep-alive comments, and then hang.
 */
async function tryModel(
  model: string,
  apiKey: string,
  system: string,
  question: string,
): Promise<LiveStream | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRST_TOKEN_TIMEOUT_MS);

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
        max_tokens: 400,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Visitor query about Divanshu: "${question}"` },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      res.body?.cancel().catch(() => {});
      clearTimeout(timer);
      return null;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        clearTimeout(timer);
        return null; // Stream ended without content.
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      const { text: firstText } = parseSse(lines);
      if (firstText) {
        clearTimeout(timer);
        return { model, reader, firstText, buffer };
      }
    }
  } catch {
    clearTimeout(timer);
    return null; // Timeout or network error — next candidate.
  }
}

export async function POST(req: Request): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(ip)) {
    return Response.json({ error: "Too many queries — take a breath" }, { status: 429 });
  }

  let question: unknown;
  let mode: Mode = "recruiter";
  try {
    const body = (await req.json()) as { question?: unknown; mode?: unknown };
    question = body.question;
    if (typeof body.mode === "string" && MODES.includes(body.mode as Mode)) {
      mode = body.mode as Mode;
    }
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof question !== "string" || !question.trim() || question.length > 500) {
    return Response.json({ error: "Invalid question" }, { status: 400 });
  }
  const q = question.trim();
  const started = Date.now();
  const p = plan(q, mode);
  const apiKey = process.env.OPENROUTER_API_KEY;

  const encoder = new TextEncoder();
  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, e: ConsoleEvent) =>
    controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // 0 — Injection screen: quarantined queries never reach a model.
        if (p.guarded) {
          emit(controller, { t: "trace", step: "guardrail", detail: "query quarantined" });
          emit(controller, { t: "trace", step: "tool", detail: "get_system()" });
          emit(controller, { t: "artifact", spec: { kind: "system" } });
          emit(controller, { t: "trace", step: "synthesis", detail: "sealed" });
          emit(controller, { t: "delta", text: p.fallback });
          emit(controller, { t: "done", ms: Date.now() - started, model: null, sources: p.sources });
          return;
        }

        // 1 — Deterministic plan: instant, works with every model offline.
        const sudo = /sudo\s+hire/i.test(q);
        emit(controller, {
          t: "trace",
          step: "intent",
          detail: p.intents.join(" + ") + (sudo ? " (sudo)" : ""),
        });
        if (sudo) {
          emit(controller, { t: "note", text: "privilege escalation approved — hiring interface unlocked." });
        }
        for (const a of p.artifacts) {
          const arg =
            a.params?.ids?.join(",") ?? a.params?.layer ?? "";
          emit(controller, { t: "trace", step: "tool", detail: `get_${a.kind}(${arg})` });
          emit(controller, { t: "artifact", spec: a });
        }

        // 2a — Preset fast path: the most-travelled queries answer instantly
        // from pre-written, dossier-grounded narration. No model involved.
        const preset = PRESET_ANSWERS[q];
        if (preset) {
          emit(controller, { t: "trace", step: "synthesis", detail: "cached" });
          emit(controller, { t: "delta", text: preset });
          emit(controller, { t: "done", ms: Date.now() - started, model: "cached", sources: p.sources });
          return;
        }

        // 2b — Narration: LLM chain, else handwritten fallback. Questions
        // about the console itself always get the canned answer — the model
        // has nothing to add about its own machinery.
        const systemOnly = p.intents.length === 1 && p.intents[0] === "system";
        let usedModel: string | null = null;
        let live: LiveStream | null = null;
        if (apiKey && !systemOnly) {
          const candidates = [
            ...(process.env.OPENROUTER_MODEL ? [process.env.OPENROUTER_MODEL] : []),
            ...FALLBACK_MODELS,
          ];
          const system = systemPrompt(p, mode);
          for (const model of candidates) {
            live = await tryModel(model, apiKey, system, q);
            if (live) break;
          }
        }

        if (live) {
          usedModel = displayModel(live.model);
          emit(controller, { t: "trace", step: "synthesis", detail: usedModel });
          emit(controller, { t: "delta", text: live.firstText });
          const decoder = new TextDecoder();
          let buffer = live.buffer;
          for (;;) {
            const { done, value } = await live.reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            const parsed = parseSse(lines);
            if (parsed.text) emit(controller, { t: "delta", text: parsed.text });
            if (parsed.done || buffer.trim() === "data: [DONE]") {
              live.reader.cancel().catch(() => {});
              break;
            }
          }
        } else {
          emit(controller, { t: "trace", step: "synthesis", detail: "deterministic" });
          emit(controller, { t: "delta", text: p.fallback });
          if (apiKey && !systemOnly) {
            emit(controller, { t: "note", text: "narration is running in deterministic mode right now — the artifacts above are exact and complete." });
          }
        }

        emit(controller, { t: "done", ms: Date.now() - started, model: usedModel, sources: p.sources });
      } catch {
        // Ensure the client always gets closure.
        try {
          emit(controller, { t: "done", ms: Date.now() - started, model: null, sources: p.sources });
        } catch {
          /* controller already closed */
        }
      } finally {
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
