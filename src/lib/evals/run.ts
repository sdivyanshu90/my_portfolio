import { isGuarded, plan } from "@/lib/intents";
import { GOLDEN, type GoldenCase } from "@/lib/evals/golden";
import { GUARD_ATTACKS, GUARD_HONEST } from "@/lib/evals/guard-cases";

export interface CaseResult {
  q: string;
  ok: boolean;
  why: string[];
  got: string;
}

export function checkCase(c: GoldenCase): CaseResult {
  const p = plan(c.q, c.mode ?? "recruiter", c.prev);
  const kinds = p.artifacts.map((a) => a.kind);
  const routed = new Set([
    ...p.entities,
    ...p.artifacts.flatMap((a) => [...(a.params?.ids ?? []), ...(a.params?.highlight ?? [])]),
  ]);
  const why: string[] = [];
  if (c.first && !c.first.includes(kinds[0])) why.push(`first=${kinds[0]}, want ${c.first.join("|")}`);
  for (const k of c.has ?? []) if (!kinds.includes(k)) why.push(`missing ${k}`);
  for (const e of c.entities ?? []) if (!routed.has(e)) why.push(`missing entity ${e}`);
  for (const e of c.notEntities ?? []) if (routed.has(e)) why.push(`misrouted to ${e}`);
  if (c.layer && !p.artifacts.some((a) => a.params?.layer === c.layer)) why.push(`missing layer ${c.layer}`);
  if (c.guarded !== undefined && p.guarded !== c.guarded) why.push(`guarded=${p.guarded}`);
  for (const t of c.absent ?? []) {
    if (!p.absence?.missing.some((m) => m.toLowerCase() === t.toLowerCase())) why.push(`should be absent: ${t}`);
  }
  if (c.noAbsence && p.absence) why.push(`falsely absent: ${p.absence.missing.join(", ")}`);
  const got =
    p.artifacts
      .map((a) => a.kind + (a.params ? `(${[a.params.layer, ...(a.params.ids ?? []), ...(a.params.highlight ?? [])].filter(Boolean).join(",")})` : ""))
      .join(" + ") + (p.guarded ? " [guarded]" : "") + (p.absence ? ` [absent: ${p.absence.missing.join(",")}]` : "");
  return { q: c.q, ok: why.length === 0, why, got };
}

export interface Scorecard {
  router: { passed: number; total: number };
  guard: { passed: number; total: number };
  failures: CaseResult[];
}

export function runEvals(): Scorecard {
  const results = GOLDEN.map(checkCase);
  const guardFails: CaseResult[] = [
    ...GUARD_HONEST.filter((q) => isGuarded(q)).map((q) => ({ q, ok: false, why: ["false positive"], got: "guarded" })),
    ...GUARD_ATTACKS.filter((q) => !isGuarded(q)).map((q) => ({ q, ok: false, why: ["missed attack"], got: "open" })),
  ];
  const guardTotal = GUARD_HONEST.length + GUARD_ATTACKS.length;
  return {
    router: { passed: results.filter((r) => r.ok).length, total: results.length },
    guard: { passed: guardTotal - guardFails.length, total: guardTotal },
    failures: [...results.filter((r) => !r.ok), ...guardFails],
  };
}
