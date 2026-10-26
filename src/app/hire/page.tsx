import type { Metadata } from "next";
import Link from "next/link";
import { DocSection, DocShell } from "@/components/doc/doc-shell";
import { ContactLink } from "@/components/contact-link";
import {
  personal,
  changelog,
  uniiqDecisionTwin,
  resume,
} from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Hiring brief — Founding Engineer, reliable AI products",
  description:
    "Ownership, selected evidence and scope: Divanshu Sharma's work on AI product reliability, evaluation and public engineering contributions.",
  alternates: { canonical: "/hire" },
};
const link =
  "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent";

export default function HiringBrief() {
  const uniiq = changelog.find((r) => r.org === "Uniiq.ai")!;
  return (
    <DocShell
      current="/hire"
      eyebrow="Hiring brief · ownership and evidence"
      title="Founding engineering for reliable AI products"
      lede={
        <p>
          {personal.name} · {personal.currentRole} · {personal.location}.{" "}
          {personal.openTo}.
        </p>
      }
    >
      <DocSection id="ownership" title="Ownership demonstrated">
        <p className="text-[16px] leading-relaxed text-ink-muted">
          At Uniiq.ai, his work spans a stateful admissions intake, model
          failure recovery, safe database updates and frontend performance. His
          focus is making AI workflows complete predictably and preserve valid
          user state.
        </p>
        <p className="mt-3 font-mono text-[12px] text-ink-faint">
          {uniiq.role} · {uniiq.span} · React, Express, MongoDB and Gemini
        </p>
      </DocSection>
      <DocSection id="evidence" title="Three reasons to look closer">
        <ol className="divide-y divide-rule-faint border-y border-rule-faint">
          <li className="py-5">
            <h3 className="text-lg font-medium">AI product reliability</h3>
            <p className="mt-2 text-ink-muted">
              A three-phase intake with persisted dialogue, schema-validated
              extraction, resumable sessions and idempotent completion.
              Recoverable failures and deterministic fallbacks protect
              onboarding; deep-partial MongoDB updates preserve nested data.
            </p>
            <p className="mt-2 text-sm text-ink-faint">
              Private engineering summary. This establishes the reported work,
              not independently inspected source code or production scale.
            </p>
            <Link
              href="/work/uniiq-platform"
              className={`mt-3 inline-block ${link}`}
            >
              Read the Uniiq case study →
            </Link>
          </li>
          <li className="py-5">
            <h3 className="text-lg font-medium">
              Evaluation with explicit constraints
            </h3>
            <p className="mt-2 text-ink-muted">{uniiqDecisionTwin.summary}</p>
            <p className="mt-2 text-sm text-ink-faint">
              Designed and evaluated offline: 30 applicant scenarios, 60
              decision artifacts and nine metrics. These are controlled
              evaluation results, not production admission outcomes.
            </p>
            <Link
              href="/work/uniiq-platform#admissions-decision-twin"
              className={`mt-3 inline-block ${link}`}
            >
              Review the evaluation and its scope →
            </Link>
          </li>
          <li className="py-5">
            <h3 className="text-lg font-medium">
              Public debugging and implementation evidence
            </h3>
            <p className="mt-2 text-ink-muted">
              Mastra issue reports and fixes cover CLI, logging and embedding
              correctness. Merged lm-evaluation-harness contributions include
              argument parsing, a restored benchmark task and request-cache
              setup. Reports resolved by maintainers are attributed separately
              from authored merged changes.
            </p>
            <p className="mt-2 text-sm text-ink-faint">
              Public issues and pull requests. From-scratch implementations
              provide additional evidence of fundamentals, with study builds
              distinguished from shipped work.
            </p>
            <Link href="/open-source" className={`mt-3 inline-block ${link}`}>
              Inspect the contribution evidence →
            </Link>
          </li>
        </ol>
      </DocSection>
      <DocSection id="discussion" title="Useful interview topics">
        <ul className="list-disc space-y-2 pl-5 text-ink-muted">
          <li>
            How resumable state and idempotent completion interact with retries
            and partial failures.
          </li>
          <li>
            How the Decision Twin baseline, scoring rules and abstention
            behavior were evaluated.
          </li>
          <li>
            How a reported upstream defect was reproduced, narrowed down and
            resolved.
          </li>
        </ul>
        <p className="mt-4 text-sm text-ink-faint">
          The Founding Engineer title does not by itself establish
          people-management scope. Enterprise operating scale and role-specific
          years should be discussed against the requirements of your role.
        </p>
      </DocSection>
      <DocSection id="contact" title="Start a conversation">
        <p className="text-ink-muted">
          Share the problem you need owned, your team context and the working
          arrangement. Start timing, location requirements and engagement terms
          can be confirmed directly.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <ContactLink
            href={`mailto:${personal.email}`}
            via="hiring-brief"
            className={link}
          >
            Email {personal.name} →
          </ContactLink>
          <Link href="/cv" className={link}>
            Current CV / save as PDF →
          </Link>
          <Link href="/fit" className={link}>
            Compare your requirements →
          </Link>
        </div>
        <p className="mt-3 text-sm text-ink-faint">
          The downloadable résumé is a snapshot dated {resume.asOf}; the current
          CV contains the latest dossier content.
        </p>
      </DocSection>
    </DocShell>
  );
}
