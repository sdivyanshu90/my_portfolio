import type { Layer } from "@/data/portfolio";

/**
 * The wire protocol between /api/ask and the console: newline-delimited
 * JSON events. Artifacts are rendered client-side from the local dossier —
 * events carry only a kind + params, never markup.
 */

export type ArtifactKind =
  | "about"
  | "projects"
  | "shipped"
  | "index"
  | "oss"
  | "experience"
  | "skills"
  | "credentials"
  | "contact"
  | "resume"
  | "availability"
  | "system";

export interface ArtifactSpec {
  kind: ArtifactKind;
  params?: {
    /** Case-study ids to show (projects); omit for featured set. */
    ids?: string[];
    /** Initial layer filter (index). */
    layer?: Layer;
  };
}

export type Mode = "recruiter" | "engineer" | "founder";

export type ConsoleEvent =
  | { t: "trace"; step: "intent" | "tool" | "synthesis" | "guardrail"; detail: string }
  | { t: "artifact"; spec: ArtifactSpec }
  | { t: "delta"; text: string }
  | { t: "note"; text: string }
  | { t: "done"; ms: number; model: string | null; sources: string[] };

export interface AskRequest {
  question: string;
  mode?: Mode;
}
