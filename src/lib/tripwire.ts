import * as dossier from "@/data/portfolio";
import { PRESET_ANSWERS } from "@/lib/preset-answers";

/**
 * Number tripwire: every figure a model states must exist somewhere in the
 * dossier. "88.08%" passes; an invented "92%" is reported. Narration is
 * streamed, so a hit can't be unsaid — it is flagged on the card instead,
 * and the narration is not cached.
 */

const norm = (n: string) => n.replace(/,/g, "").replace(/\.0+$/, "").replace(/%$/, "");

const FIGURE = /(?<![\w.])\d[\d,]*(?:\.\d+)?%?/g;

let known: Set<string> | null = null;
function knownFigures(): Set<string> {
  if (known) return known;
  const corpus = JSON.stringify(dossier) + JSON.stringify(PRESET_ANSWERS);
  known = new Set((corpus.match(FIGURE) ?? []).map(norm));
  return known;
}

/** Figures in `text` that the dossier never states (years and 1–10 are exempt). */
export function unverifiedFigures(text: string): string[] {
  const figures = knownFigures();
  const out = new Set<string>();
  for (const raw of text.match(FIGURE) ?? []) {
    const n = norm(raw);
    const v = Number(n);
    if (Number.isFinite(v) && ((v >= 0 && v <= 10 && !raw.includes(".")) || (v >= 1990 && v <= 2035))) continue;
    if (!figures.has(n)) out.add(raw);
  }
  return [...out];
}
