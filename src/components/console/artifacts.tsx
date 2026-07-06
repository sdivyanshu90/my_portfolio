import Image from "next/image";
import { CountUp } from "@/components/console/count-up";
import { Capabilities } from "@/components/capabilities";
import { CaseStudyFigure } from "@/components/case-study";
import { Changelog } from "@/components/changelog";
import { Correspondence } from "@/components/correspondence";
import { Credentials } from "@/components/credentials";
import { FieldNotes } from "@/components/field-notes";
import { ScratchIndex } from "@/components/scratch-index";
import { SystemCard } from "@/components/system-card";
import {
  caseStudies,
  keyResults,
  personal,
  resume,
  shipped,
} from "@/data/portfolio";
import type { ArtifactSpec } from "@/lib/protocol";

/**
 * The artifact registry: every answer the console gives is composed from
 * these pre-built, typed components — the model narrates, it never
 * generates UI. Renderable from both server (boot cell) and client (runs).
 */

function AboutArtifact() {
  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-2xl font-medium tracking-tight sm:text-3xl">
            {personal.name}
          </p>
          <p className="mt-2 font-mono text-[13px] leading-relaxed text-ink">
            {personal.lead}
          </p>
          <p className="mt-1 font-mono text-[12px] text-ink-muted">
            {personal.currentRole} · {personal.location}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 font-mono text-[12px] text-accent">
            <span aria-hidden className="inline-block size-2 rounded-full bg-accent" />
            {personal.openTo}
          </p>
        </div>
        <figure className="shrink-0">
          <Image
            src={personal.avatar}
            alt={`Portrait of ${personal.name}`}
            width={104}
            height={104}
            priority
            className="size-16 rounded-sm border border-rule object-cover grayscale sm:size-20"
          />
          <figcaption className="sr-only">Portrait of {personal.name}</figcaption>
        </figure>
      </div>
      <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-ink-muted italic">
        {personal.abstract[0]}
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-rule-faint pt-5 lg:grid-cols-4">
        {keyResults.map((r) => (
          <li key={r.label}>
            <p className="font-mono text-xl tracking-tight text-accent sm:text-2xl">
              <CountUp display={r.display} />
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink">{r.label}</p>
            <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-ink-faint">
              {r.note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectsArtifact({ ids }: { ids?: string[] }) {
  const shown = ids?.length
    ? caseStudies.filter((c) => ids.includes(c.id))
    : caseStudies;
  return (
    <div className="space-y-6">
      {shown.map((s) => (
        <CaseStudyFigure key={s.id} study={s} />
      ))}
    </div>
  );
}

/** The 0→1 ledger — ownership-first, for the founder lens. */
function ShippedArtifact() {
  return (
    <div>
      <p className="mb-4 max-w-prose font-mono text-[11px] leading-relaxed text-ink-faint">
        Built end-to-end and shipped — what he owned, not what he studied.
      </p>
      <ol className="divide-y divide-rule-faint border-y border-rule">
        {shipped.map((s) => (
          <li key={s.name} className="py-3.5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <a
                href={s.href}
                className="font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {s.name}
              </a>
              <span className="bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-accent uppercase">
                {s.tag}
              </span>
              <span className="font-mono text-[11px] text-ink-faint">{s.role}</span>
            </div>
            <p className="mt-1.5 max-w-prose text-[14px] leading-relaxed text-ink-muted">
              {s.what}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ResumeArtifact() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-rule bg-surface px-5 py-4">
      <div>
        <p className="font-medium">{personal.name} — Résumé</p>
        <p className="mt-1 font-mono text-[11px] text-ink-faint">
          One page · PDF · rev May 2026
        </p>
      </div>
      <a
        href={resume.href}
        className="border border-accent px-4 py-2 font-mono text-[12px] tracking-wider text-accent uppercase transition-colors hover:bg-accent hover:text-paper"
      >
        Download ↓
      </a>
    </div>
  );
}

function AvailabilityArtifact() {
  return (
    <div className="border border-rule bg-surface px-5 py-5">
      <p className="inline-flex items-center gap-2 font-mono text-[12px] text-accent">
        <span aria-hidden className="inline-block size-2 rounded-full bg-accent" />
        {personal.openTo}
      </p>
      <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-ink-muted">
        Currently {personal.currentRole.replace("@", "at")}. Based in{" "}
        {personal.location}; remote-friendly. Fastest route is email — replies
        typically within a day.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px]">
        <a
          href={`mailto:${personal.email}`}
          className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {personal.email}
        </a>
        <a
          href={resume.href}
          className="text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          Résumé ↓
        </a>
      </div>
    </div>
  );
}

export function ArtifactView({ spec }: { spec: ArtifactSpec }) {
  switch (spec.kind) {
    case "about":
      return <AboutArtifact />;
    case "projects":
      return <ProjectsArtifact ids={spec.params?.ids} />;
    case "shipped":
      return <ShippedArtifact />;
    case "index":
      return <ScratchIndex initialLayer={spec.params?.layer} />;
    case "oss":
      return <FieldNotes />;
    case "experience":
      return <Changelog />;
    case "skills":
      return <Capabilities />;
    case "credentials":
      return <Credentials />;
    case "contact":
      return <Correspondence />;
    case "resume":
      return <ResumeArtifact />;
    case "availability":
      return <AvailabilityArtifact />;
    case "system":
      return <SystemCard />;
    default:
      return null;
  }
}
