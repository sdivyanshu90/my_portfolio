import { allDocs, type Doc } from "@/lib/retrieval";

/**
 * An epistemic cache for the portfolio — his EpiCache idea, applied to his
 * own site. Every answer records the dossier facts it relied on, each with a
 * content fingerprint. When the dossier changes, only answers whose facts
 * changed are invalidated (the narration cache) or marked stale (shared
 * runs, with a before/after diff). Nothing else is touched.
 */

export interface FactRef {
  id: string;
  hash: string;
  label: string;
  /** Snapshot of the fact's text when the answer was given (for the diff). */
  text: string;
}

export interface StaleFact {
  id: string;
  label: string;
  before: string;
  /** null when the fact no longer exists in the dossier. */
  after: string | null;
}

const text = (d: Doc) => `${d.strong}. ${d.body}`.replace(/\s+/g, " ").trim();

/** FNV-1a, 32-bit, hex — stable across server and browser. */
export function fingerprint(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

let current: Map<string, Doc> | null = null;
function docs(): Map<string, Doc> {
  current ??= new Map(allDocs().map((d) => [d.id, d]));
  return current;
}

export function snapshot(ids: string[]): FactRef[] {
  const all = docs();
  return [...new Set(ids)].flatMap((id) => {
    const d = all.get(id);
    if (!d) return [];
    const t = text(d);
    return [{ id, hash: fingerprint(t), label: d.label, text: t.slice(0, 400) }];
  });
}

/** Facts from a snapshot that have since changed or disappeared. */
export function staleFacts(refs: Pick<FactRef, "id" | "hash" | "label" | "text">[] | undefined): StaleFact[] {
  if (!refs?.length) return [];
  const all = docs();
  return refs.flatMap((r): StaleFact[] => {
    const d = all.get(r.id);
    if (!d) return [{ id: r.id, label: r.label, before: r.text, after: null }];
    const t = text(d);
    return fingerprint(t) === r.hash ? [] : [{ id: r.id, label: d.label, before: r.text, after: t.slice(0, 400) }];
  });
}
