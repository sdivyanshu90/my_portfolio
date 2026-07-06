"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArtifactView } from "@/components/console/artifacts";
import { ArtifactWipe, CardShell, type TraceStep } from "@/components/console/card";
import { nodesForDraft, nodesForSpecs } from "@/components/console/field";

// The constellation is pure enhancement — never let it block hydration.
const Field = dynamic(() => import("@/components/console/field").then((m) => m.Field), {
  ssr: false,
});
import { MODE_LABELS, PRESETS } from "@/components/console/presets";
import type { ArtifactSpec, ConsoleEvent, Mode } from "@/lib/protocol";

const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

/** While a run is in flight, the button waxes and wanes through the moon. */
function MoonSpinner() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => setI((n) => (n + 1) % MOON_PHASES.length), 110);
    return () => clearInterval(iv);
  }, [reduce]);
  return (
    <span aria-label="working" className="inline-block w-6 text-center">
      {reduce ? "…" : MOON_PHASES[i]}
    </span>
  );
}

interface Run {
  id: number;
  question: string;
  trace: TraceStep[];
  artifacts: ArtifactSpec[];
  text: string;
  note: string | null;
  status: "running" | "done" | "error";
  ms: number | null;
  model: string | null;
  sources: string[];
}

/**
 * The DIV-1 stage: a single non-scrolling viewport. The constellation
 * behind the card is the portfolio (every star a real system); a question
 * makes the relevant stars converge and the answer assembles center-stage.
 */
export function Console({ bootCard }: { bootCard: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("recruiter");
  const [input, setInput] = useState("");
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [scanKey, setScanKey] = useState(0);
  const [convergeKey, setConvergeKey] = useState(0);
  const [dismissKey, setDismissKey] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [wardKey, setWardKey] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [tab, setTab] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  const activeRunId = useRef(0);
  const reduce = useReducedMotion();

  const draftIds = useMemo(() => (busy ? [] : nodesForDraft(input)), [input, busy]);

  // Rotating placeholder — a quiet tour of what you can ask.
  const placeholders = useMemo(
    () => ["Ask about systems, experience, availability…", ...PRESETS[mode]],
    [mode],
  );
  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => setPlaceholderIdx((i) => i + 1), 3800);
    return () => clearInterval(iv);
  }, [reduce]);

  // "/" or ⌘K focuses the prompt from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;
      if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setInput("");
      setBusy(true);
      setTab(0);
      setActiveIds([]);
      setScanKey((k) => k + 1); // astrolabe sweep begins immediately

      // Supersede any in-flight run: abort its fetch and ignore its events.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const id = nextId.current++;
      activeRunId.current = id;
      const live = () => activeRunId.current === id && !controller.signal.aborted;

      let current: Run = {
        id,
        question: q,
        trace: [],
        artifacts: [],
        text: "",
        note: null,
        status: "running",
        ms: null,
        model: null,
        sources: [],
      };
      setRun(current);
      const patch = (fn: (r: Run) => Run) => {
        if (!live()) return; // a dismissed/superseded run must not resurrect
        current = fn(current);
        setRun(current);
      };

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, mode }),
          signal: controller.signal,
        });
        if (res.status === 429) {
          patch((r) => ({
            ...r,
            status: "error",
            note: "you're querying fast — give it a minute, then try again.",
          }));
          return;
        }
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          if (!live()) {
            reader.cancel().catch(() => {});
            return;
          }
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let e: ConsoleEvent;
            try {
              e = JSON.parse(line) as ConsoleEvent;
            } catch {
              continue;
            }
            if (e.t === "trace") {
              patch((r) => ({ ...r, trace: [...r.trace, { step: e.step, detail: e.detail }] }));
              if (e.step === "guardrail") setWardKey((k) => k + 1);
            } else if (e.t === "artifact") {
              const first = current.artifacts.length === 0;
              patch((r) => ({ ...r, artifacts: [...r.artifacts, e.spec] }));
              setActiveIds(nodesForSpecs(current.artifacts));
              if (first) setConvergeKey((k) => k + 1);
            } else if (e.t === "delta") {
              patch((r) => ({ ...r, text: r.text + e.text }));
            } else if (e.t === "note") {
              patch((r) => ({ ...r, note: e.text }));
              if (e.text.includes("privilege escalation")) setBurstKey((k) => k + 1);
            } else if (e.t === "done") {
              patch((r) => ({ ...r, status: "done", ms: e.ms, model: e.model, sources: e.sources }));
            }
          }
        }
        patch((r) => (r.status === "running" ? { ...r, status: "done" } : r));
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        patch((r) => ({
          ...r,
          status: "error",
          note: "network error — every fact is still one query away; try again or use the header links.",
        }));
      } finally {
        if (activeRunId.current === id) setBusy(false);
      }
    },
    [busy, mode],
  );

  const dismiss = useCallback(() => {
    activeRunId.current = 0; // orphan any in-flight run's events
    abortRef.current?.abort();
    setBusy(false);
    setRun(null);
    setActiveIds([]);
    setDismissKey((k) => k + 1); // the answer scatters back into the sky
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Deep link: ?q=…&mode=… opens the page mid-answer (shareable runs).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const m = params.get("mode");
    if (m && ["recruiter", "engineer", "founder"].includes(m)) setMode(m as Mode);
    if (q && q.trim()) {
      const t = setTimeout(() => ask(q.slice(0, 280)), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [copied, setCopied] = useState(false);
  const share = useCallback(() => {
    if (!run) return;
    const url = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(run.question)}&mode=${mode}`;
    // Reflect the current run in the address bar for easy manual copy too.
    window.history.replaceState(null, "", url);
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  }, [run, mode]);

  const showTabs = (run?.artifacts.length ?? 0) > 1;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Stage */}
      <div className="relative min-h-0 flex-1">
        <Field
          draftIds={draftIds}
          activeIds={activeIds}
          scanKey={scanKey}
          convergeKey={convergeKey}
          dismissKey={dismissKey}
          burstKey={burstKey}
          wardKey={wardKey}
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-5 sm:px-10 sm:py-7">
          <div className="flex h-full w-full max-w-3xl items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {run ? (
                <motion.div
                  key={`run-${run.id}`}
                  className="flex max-h-full w-full justify-center"
                  initial={reduce ? false : { opacity: 0, scale: 0.965 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <CardShell
                    animated
                    label={`run ${String(run.id).padStart(2, "0")}`}
                    question={run.question}
                    trace={run.trace}
                    running={run.status === "running"}
                    narration={
                      run.text ? (
                        <>
                          {run.text}
                          {run.status === "running" ? (
                            <span aria-hidden className="animate-pulse text-accent motion-reduce:animate-none">
                              ▍
                            </span>
                          ) : null}
                        </>
                      ) : run.status === "running" && run.artifacts.length ? (
                        // Artifacts are already exact and on screen; prose is
                        // drafting. Make the wait legible instead of a stall.
                        <span className="font-mono text-[12px] text-ink-faint">
                          answer ready below · drafting narration
                          <span aria-hidden className="animate-pulse text-accent motion-reduce:animate-none">
                            …
                          </span>
                        </span>
                      ) : undefined
                    }
                    note={run.note}
                    footer={
                      run.status === "done"
                        ? {
                            model: run.model ?? "deterministic",
                            ms: run.ms != null ? `${(run.ms / 1000).toFixed(1)}s` : "—",
                            sources: run.sources,
                          }
                        : null
                    }
                    actions={
                      <span className="flex items-center gap-3">
                        {run.status === "done" ? (
                          <button
                            type="button"
                            onClick={share}
                            aria-label="Copy a shareable link to this answer"
                            className="font-mono text-[10px] tracking-wider text-ink-faint uppercase transition-colors hover:text-accent"
                          >
                            {copied ? "✓ link copied" : "share ↗"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={dismiss}
                          aria-label="Dismiss answer"
                          className="font-mono text-[13px] text-ink-faint transition-colors hover:text-accent"
                        >
                          ✕
                        </button>
                      </span>
                    }
                  >
                    {run.artifacts.length ? (
                      <div>
                        {showTabs ? (
                          <div role="group" aria-label="Answer artifacts" className="mb-4 flex gap-2">
                            {run.artifacts.map((a, i) => (
                              <button
                                key={`${a.kind}-${i}`}
                                type="button"
                                aria-pressed={tab === i}
                                onClick={() => setTab(i)}
                                className={`relative border px-3 py-1 font-mono text-[10px] tracking-wide uppercase transition-colors ${
                                  tab === i
                                    ? "border-accent text-paper"
                                    : "border-rule text-ink-muted hover:border-accent hover:text-accent"
                                }`}
                              >
                                {tab === i ? (
                                  <motion.span
                                    layoutId="artifact-tab-ink"
                                    aria-hidden
                                    className="absolute inset-0 bg-accent"
                                    transition={{ duration: reduce ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                  />
                                ) : null}
                                <span className="relative">{a.kind}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={tab}
                            initial={reduce ? false : { opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={reduce ? undefined : { opacity: 0, x: -10 }}
                            transition={{ duration: 0.22 }}
                          >
                            <ArtifactWipe animated>
                              <ArtifactView
                                spec={run.artifacts[Math.min(tab, run.artifacts.length - 1)]}
                              />
                            </ArtifactWipe>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    ) : undefined}
                  </CardShell>
                </motion.div>
              ) : (
                <motion.div
                  key="boot"
                  className="flex max-h-full w-full justify-center"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {bootCard}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Command bar */}
      <div className="border-t border-rule bg-paper px-4 pt-3 pb-3 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
              mode
            </span>
            {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`relative border px-2.5 py-1 font-mono text-[10px] tracking-wide uppercase transition-colors ${
                  mode === m
                    ? "border-accent text-paper"
                    : "border-rule text-ink-muted hover:border-accent hover:text-accent"
                }`}
              >
                {mode === m ? (
                  <motion.span
                    layoutId="mode-ink"
                    aria-hidden
                    className="absolute inset-0 bg-accent"
                    transition={{ duration: reduce ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                ) : null}
                <span className="relative">{MODE_LABELS[m]}</span>
              </button>
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => ask("Show the system card")}
              className="border border-rule px-2.5 py-1 font-mono text-[10px] tracking-wide text-ink-muted uppercase transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              system card
            </button>
            <p className="ml-auto hidden font-mono text-[10px] text-ink-faint md:block">
              © 2026 Divanshu Sharma ·{" "}
              <a
                href="https://github.com/sdivyanshu90/my_portfolio"
                className="underline decoration-rule underline-offset-2 transition-colors hover:text-accent"
              >
                view source ↗
              </a>
            </p>
          </div>

          <motion.form
            animate={
              shaking && !reduce ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }
            }
            transition={{ duration: 0.35 }}
            onAnimationComplete={() => setShaking(false)}
            className={`group mt-2.5 flex items-center gap-3 border bg-surface px-4 transition-colors focus-within:border-accent ${
              busy ? "animate-pulse border-accent/60 motion-reduce:animate-none" : "border-rule"
            }`}
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) {
                setShaking(true);
                return;
              }
              ask(input);
            }}
          >
            <span
              aria-hidden
              className="font-mono text-lg text-accent transition-transform duration-200 group-focus-within:translate-x-0.5"
            >
              ›
            </span>
            <label htmlFor="console-input" className="sr-only">
              Query DIV-1 about Divanshu Sharma
            </label>
            <input
              id="console-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholders[placeholderIdx % placeholders.length]}
              maxLength={280}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-3 font-mono text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <kbd
              aria-hidden
              className="hidden shrink-0 border border-rule px-1.5 py-0.5 font-mono text-[10px] text-ink-faint transition-opacity duration-200 group-focus-within:opacity-0 sm:block"
            >
              /
            </kbd>
            <button
              type="submit"
              disabled={busy}
              className="shrink-0 border border-accent px-4 py-1.5 font-mono text-[11px] tracking-wider text-accent uppercase transition-colors hover:bg-accent hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? <MoonSpinner /> : "run"}
            </button>
          </motion.form>

          <div
            key={mode}
            className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PRESETS[mode].map((p, i) => (
              <motion.button
                key={p}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.05 }}
                type="button"
                disabled={busy}
                onClick={() => ask(p)}
                className="shrink-0 border border-rule px-3 py-1.5 font-mono text-[11px] whitespace-nowrap text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {p}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
