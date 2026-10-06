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
  | "fit"
  | "system";

export interface ArtifactSpec {
  kind: ArtifactKind;
  params?: {
    /** Case-study ids to show (projects); omit for featured set. */
    ids?: string[];
    /** Initial layer filter (index). */
    layer?: Layer;
    /** Repos the query matched (index) — shown first and marked. */
    highlight?: string[];
  };
}

export type Mode = "recruiter" | "engineer" | "founder";

export type TraceStepName = "intent" | "retrieve" | "tool" | "synthesis" | "guardrail";

export type ConsoleEvent =
  | { t: "trace"; step: TraceStepName; detail: string }
  | { t: "artifact"; spec: ArtifactSpec }
  | { t: "delta"; text: string }
  | { t: "note"; text: string }
  | {
      t: "done";
      ms: number;
      model: string | null;
      sources: string[];
      /** Suggested next questions (chips under the answer). */
      followUps?: string[];
      /** Permalink id (/r/<id>) when runs are persisted. */
      runId?: string;
      /** Cost receipt for a live narration. */
      usage?: { tokens: number; costUsd: number | null };
      /** Nothing on record for this — offer the handoff to Divanshu. */
      miss?: boolean;
    };

/** A finished run as persisted for /r/<id>. */
export interface StoredRun {
  q: string;
  mode: Mode;
  at: string;
  trace: { step: TraceStepName; detail: string }[];
  artifacts: ArtifactSpec[];
  narration: string;
  sources: string[];
  model: string | null;
  ms: number;
  followUps: string[];
  usage?: { tokens: number; costUsd: number | null };
  /** The facts this answer relied on, fingerprinted (see lib/facts). */
  facts?: { id: string; hash: string; label: string; text: string }[];
  /** Console notes shown with the answer (e.g. the tripwire's warning). */
  notes?: string[];
  /** Figures the tripwire could not find in the dossier — replays keep the warning. */
  suspect?: string[];
}

export interface AskRequest {
  question: string;
  mode?: Mode;
  /** The previous question, so "and the tests?" can resolve. */
  prev?: string;
}
