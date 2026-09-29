import { site } from "@/data/portfolio";
import { type Doc, MIN_SCORE, search, tokens } from "@/lib/retrieval";

/**
 * Requirement → evidence matching over the dossier. Paste a job description;
 * every requirement line gets the facts that support it, a strength, and an
 * honest "gap" where the dossier has nothing. Deterministic — no model — so
 * it can't flatter.
 */

export type Strength = "strong" | "partial" | "gap";

export interface Evidence {
  type: string;
  name: string;
  url: string;
}

export interface FitRow {
  requirement: string;
  strength: Strength;
  /** Fraction of the requirement's content words found in the evidence. */
  coverage: number;
  evidence: Evidence[];
}

/** Where a dossier fact lives on the site (or upstream). */
export function urlFor(doc: Doc): string {
  const [type, key] = [doc.id.slice(0, doc.id.indexOf(":")), doc.id.slice(doc.id.indexOf(":") + 1)];
  switch (type) {
    case "case":
      return `${site.url}/work/${key}`;
    case "repo":
    case "guide":
      return `https://github.com/${key}`;
    case "oss":
      return `${site.url}/open-source`;
    case "role":
    case "skill":
    case "edu":
    case "cert":
    case "honor":
      return `${site.url}/cv`;
    case "ship":
      return doc.star ? `${site.url}/work/${doc.star}` : `${site.url}/work#shipped`;
    default:
      return site.url;
  }
}

/**
 * A first line with no bullet, above bulleted lines, is the role title
 * ("Senior ML Engineer — LLM Platform") — not a requirement to score.
 */
function dropTitle(text: string): string {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const bullet = /^\s*(?:[-*•–—]|\d+[.)])\s+/;
  if (lines.length > 1 && !bullet.test(lines[0]) && lines.slice(1).some((l) => bullet.test(l))) {
    return lines.slice(1).join("\n");
  }
  return text;
}

/** Split a pasted JD into requirement-sized lines. */
export function splitRequirements(text: string): string[] {
  return dropTitle(text)
    .split(/\r?\n|•|·|;|•/)
    .flatMap((line) => (line.length > 220 ? line.split(/(?<=\.)\s+(?=[A-Z])/) : [line]))
    .map((s) => s.replace(/^[\s\-*–—]+|^\d+[.)]\s+/g, "").trim())
    .filter((s) => s.length >= 6 && s.length <= 300 && tokens(s).length >= 1)
    .slice(0, 30);
}

const docTokens = new Map<string, Set<string>>();
function tokensOf(doc: Doc): Set<string> {
  let t = docTokens.get(doc.id);
  if (!t) {
    t = new Set(tokens(`${doc.strong} ${doc.body}`));
    docTokens.set(doc.id, t);
  }
  return t;
}

/** JD boilerplate that says nothing about *what* — dropped before matching. */
const BOILERPLATE =
  /\b(?:senior|junior|staff|principal|lead|\d+\+?\s*years?|years?|experience(?:d)?(?: with| in)?|familiarity(?: with)?|knowledge of|understanding of|proficien\w*(?: in| with)?|strong|solid|proven|ability to|track record|preferred|required|must|nice to have|bonus|plus|engineers?|engineering team|role|candidate|you will|you have)\b/gi;

export function matchRequirement(requirement: string): FitRow {
  const core = requirement.replace(BOILERPLATE, " ");
  const hits = search(core);
  const top = hits[0]?.score ?? 0;
  const evidenceHits = top >= MIN_SCORE ? hits.filter((h) => h.score >= top * 0.5).slice(0, 3) : [];
  const want = [...new Set(tokens(core))];
  const found = new Set<string>();
  for (const h of evidenceHits) for (const t of want) if (tokensOf(h.doc).has(t)) found.add(t);
  const coverage = want.length ? found.size / want.length : 0;
  const strength: Strength =
    !evidenceHits.length || coverage < 0.25 ? "gap" : coverage >= 0.6 && top >= MIN_SCORE * 2 ? "strong" : "partial";
  return {
    requirement,
    strength,
    coverage: Math.round(coverage * 100) / 100,
    evidence:
      strength === "gap"
        ? []
        : evidenceHits.map((h) => ({ type: h.doc.id.split(":")[0], name: h.doc.label, url: urlFor(h.doc) })),
  };
}

export function matchRequirements(text: string): FitRow[] {
  return splitRequirements(text).map(matchRequirement);
}

export function fitSummary(rows: FitRow[]) {
  const n = (s: Strength) => rows.filter((r) => r.strength === s).length;
  return { total: rows.length, strong: n("strong"), partial: n("partial"), gap: n("gap") };
}

/**
 * Interview prep pack: for each strong match, the deep-dive question he's
 * ready for, anchored on the evidence to read first. Hiring teams get a
 * structured interview; it happens on his strongest ground.
 */
/** Richest evidence first: a case study says more than a skill line. */
const EVIDENCE_RANK = ["case", "ship", "role", "oss", "repo", "skill"];

const REPO_QUESTIONS = [
  (x: string) => `You rebuilt ${x} from scratch — what is its core mechanism, and how did you test it?`,
  (x: string) => `In ${x}, what would break first under production load, and how would you harden it?`,
  (x: string) => `What did building ${x} from scratch teach you that the library docs don't?`,
];

export function interviewQuestions(rows: FitRow[]): { q: string; name: string; url: string }[] {
  const out: { q: string; name: string; url: string }[] = [];
  const seen = new Set<string>();
  let repoTurn = 0;
  for (const r of rows) {
    if (r.strength !== "strong") continue;
    const e = [...r.evidence]
      .filter((x) => !seen.has(x.name) && EVIDENCE_RANK.includes(x.type))
      .sort((a, b) => EVIDENCE_RANK.indexOf(a.type) - EVIDENCE_RANK.indexOf(b.type))[0];
    if (!e) continue;
    const q =
      e.type === "case"
        ? `${e.name}: what made its results hard to get, and what would you change now?`
        : e.type === "ship"
          ? `You shipped ${e.name} end-to-end — what did you cut to ship it, and what broke after?`
          : e.type === "role"
            ? `As ${e.name}, which technical decision would you defend hardest?`
            : e.type === "oss"
              ? `What did landing PRs in ${e.name} teach you about that codebase?`
              : e.type === "repo"
                ? REPO_QUESTIONS[repoTurn++ % REPO_QUESTIONS.length](e.name)
                : `Where have you used ${e.name} in production, and what failed first?`;
    seen.add(e.name);
    out.push({ q, name: e.name, url: e.url });
  }
  return out.slice(0, 6);
}
