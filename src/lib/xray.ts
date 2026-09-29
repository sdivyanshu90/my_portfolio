import { urlFor } from "@/lib/fit";
import { MIN_SCORE, search, tokens } from "@/lib/retrieval";

/**
 * Sentence x-ray: attribute each sentence of a narration to the dossier fact
 * that best supports it, using the console's own retrieval. A sentence whose
 * content words mostly don't appear in any supporting fact is flagged —
 * attribution for LLM output, done live.
 */

export interface Attribution {
  sentence: string;
  supported: boolean;
  source?: { name: string; url: string };
  coverage: number;
}

export function splitSentences(text: string): string[] {
  // Break only at . ! ? followed by space + a capital — never inside "0.7s".
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z“"(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Signposts ("Full figure below.") point at the cards — not claims to check. */
const SIGNPOST = /\b(?:below|above)\.?$/i;

export function attribute(sentence: string): Attribution {
  if (SIGNPOST.test(sentence) && sentence.split(/\s+/).length <= 8) return { sentence, supported: true, coverage: 1 };
  const want = [...new Set(tokens(sentence))];
  if (want.length < 2) return { sentence, supported: true, coverage: 1 }; // too short to judge
  const hits = search(sentence).slice(0, 3);
  if (!hits.length || hits[0].score < MIN_SCORE) return { sentence, supported: false, coverage: 0 };
  const found = new Set<string>();
  for (const h of hits) {
    const doc = new Set(tokens(`${h.doc.strong} ${h.doc.body}`));
    for (const t of want) if (doc.has(t)) found.add(t);
  }
  const coverage = found.size / want.length;
  return {
    sentence,
    supported: coverage >= 0.35,
    source: { name: hits[0].doc.label, url: urlFor(hits[0].doc) },
    coverage: Math.round(coverage * 100) / 100,
  };
}

export const xray = (text: string) => splitSentences(text).map(attribute);
