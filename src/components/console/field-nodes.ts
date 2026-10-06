import { caseStudies, layers, scratchIndex, openSource } from "@/data/portfolio";
import { starRelevance } from "@/lib/retrieval";
import type { ArtifactSpec } from "@/lib/protocol";

/**
 * The sky's data — which stars exist and which a run lights up. Kept apart
 * from the canvas (field.tsx) so the console can use it without pulling the
 * whole effect engine into the first-load bundle.
 */

export interface FieldNode {
  id: string;
  label: string;
  sub: string;
  url: string;
  cluster: number;
}

export const FIELD_NODES: FieldNode[] = [
  ...scratchIndex.map((e) => ({
    id: e.repo,
    label: e.name,
    sub: `${e.layer} · ${e.lang}`,
    url: `https://github.com/${e.repo}`,
    cluster: layers.indexOf(e.layer),
  })),
  ...caseStudies.map((c) => ({
    id: c.id,
    label: c.title,
    sub: c.domain,
    url: c.links[0]?.href ?? "https://github.com/sdivyanshu90",
    cluster: 5,
  })),
  // One star per upstream project he has sent PRs to.
  ...openSource
    .filter((o) => o.role !== "Author")
    .map((o) => ({
      id: `oss:${o.name}`,
      label: o.name,
      sub: [
        o.merged ? `${o.merged} merged` : null,
        o.authored ? `${o.authored} PRs` : null,
        o.reportedFixed?.length ? `${o.reportedFixed.length} fixed upstream` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      url: o.href,
      cluster: 6,
    })),
];

/** Map a run's artifact specs to the stars that should converge. */
export function nodesForSpecs(specs: ArtifactSpec[]): string[] {
  const ids = new Set<string>();
  for (const s of specs) {
    if (s.kind === "index") {
      for (const e of scratchIndex) {
        const { layer, highlight } = s.params ?? {};
        if (highlight ? highlight.includes(e.repo) : !layer || e.layer === layer) ids.add(e.repo);
      }
    } else if (s.kind === "projects") {
      for (const c of caseStudies) {
        if (!s.params?.ids || s.params.ids.includes(c.id)) ids.add(c.id);
      }
    } else if (s.kind === "shipped") {
      // Light the case-study stars — the shipped ledger draws on applied work.
      for (const c of caseStudies) ids.add(c.id);
    } else if (s.kind === "oss") {
      for (const n of FIELD_NODES) if (n.cluster === 6) ids.add(n.id);
    } else if (s.kind === "about" || s.kind === "system") {
      for (const n of FIELD_NODES) ids.add(n.id);
    }
  }
  return [...ids];
}

/**
 * Live matching while the visitor types: star id → relevance 0..1. The
 * brightness you see is the router's actual retrieval score.
 */
export function nodesForDraft(q: string): Map<string, number> {
  return starRelevance(q);
}
