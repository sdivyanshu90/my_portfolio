import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactView } from "@/components/console/artifacts";
import { CardShell } from "@/components/console/card";
import { DocShell } from "@/components/doc/doc-shell";
import { staleFacts } from "@/lib/facts";
import type { StoredRun } from "@/lib/protocol";
import { loadRun } from "@/lib/runs";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function load(id: string): Promise<StoredRun | null> {
  return loadRun(getStore(), id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const run = await load((await params).id);
  if (!run) return { title: "Run not found", robots: { index: false } };
  return {
    title: `“${run.q}”`,
    description: run.narration.slice(0, 200),
    robots: { index: false },
  };
}

/**
 * A shared run, replayed exactly as it was answered — the same card, trace,
 * artifacts and sources — without asking anything again.
 */
export default async function SharedRun({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await load(id);
  if (!run) notFound();
  // Epistemic check: did any fact this answer relied on change since?
  const stale = staleFacts(run.facts);
  return (
    <DocShell
      current=""
      eyebrow={`Shared run · ${run.mode} mode · ${run.at.slice(0, 10)}`}
      title={`“${run.q}”`}
      lede={
        <p>
          Replayed exactly as DIV-1 answered it — nothing re-asked.{" "}
          <Link href={`/?q=${encodeURIComponent(run.q)}&mode=${run.mode}`} className="text-accent underline underline-offset-4">
            Ask it live →
          </Link>
        </p>
      }
      ask={run.followUps}
    >
      {stale.length ? (
        <aside className="mb-6 border border-accent bg-accent-soft/40 px-5 py-4" aria-label="This answer has changed">
          <p className="font-mono text-[11px] tracking-[0.15em] text-accent uppercase">
            Changed since this answer was given · {stale.length} fact{stale.length > 1 ? "s" : ""} updated
          </p>
          <p className="mt-1.5 max-w-prose text-[14px] leading-relaxed text-ink-muted">
            DIV-1 tracks which dossier facts every answer relied on. These have been updated since — the rest of the
            answer still stands.{" "}
            <Link href={`/?q=${encodeURIComponent(run.q)}&mode=${run.mode}`} className="text-accent underline underline-offset-4">
              Ask it again for the current answer →
            </Link>
          </p>
          <ul className="mt-3 space-y-3">
            {stale.map((f) => (
              <li key={f.id} className="text-[13px]">
                <p className="font-medium text-ink">{f.label}</p>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-ink-faint line-through decoration-accent/60">
                  {f.before}
                </p>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-ink">
                  {f.after ?? "— removed from the dossier —"}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
      <CardShell
        label={`run ${id.slice(0, 4)}`}
        question={run.q}
        trace={run.trace}
        narration={run.narration}
        note={
          run.suspect?.length
            ? `unverified figure${run.suspect.length > 1 ? "s" : ""} in this narration: ${run.suspect.join(", ")} — not in his dossier; treat as unconfirmed. The cards below are exact.`
            : (run.notes?.at(-1) ?? null)
        }
        footer={{ model: run.model ?? "deterministic", ms: `${(run.ms / 1000).toFixed(1)}s`, sources: run.sources }}
      >
        <div className="space-y-10">
          {run.artifacts.map((a, i) => (
            <ArtifactView key={`${a.kind}-${i}`} spec={a} />
          ))}
        </div>
      </CardShell>
    </DocShell>
  );
}
