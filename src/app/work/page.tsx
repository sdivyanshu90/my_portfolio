import type { Metadata } from "next";
import Link from "next/link";
import { ShippedArtifact } from "@/components/console/artifacts";
import { DocSection, DocShell } from "@/components/doc/doc-shell";
import { caseStudies, counts, principles } from "@/data/portfolio";
import { Spell } from "@/lib/words";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected systems with measured results — Uniiq's AI advising platform, privacy-preserving deep learning under MPC, Hindi ASR evaluation, historical OCR, a paged KV-cache engine, and more.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  return (
    <DocShell
      current="/work"
      eyebrow={`${Spell(counts.caseStudies)} figures`}
      title="Selected work, with measured results"
      lede="Each figure is problem → approach → results, with a receipt for where the numbers come from. The shipped ledger below lists what he built end-to-end and owned."
      ask={["Show shipped systems with measured results", "What is he doing at Uniiq?", "How does he think about evaluation?"]}
    >
      <DocSection id="figures" title="Figures">
        <ol className="divide-y divide-rule-faint border-y border-rule-faint">
          {caseStudies.map((c) => (
            <li key={c.id}>
              <Link href={`/work/${c.id}`} className="group grid gap-x-8 gap-y-1 py-5 sm:grid-cols-[64px_1fr_220px]">
                <span className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Fig. {c.fig}</span>
                <span>
                  <span className="block text-lg font-medium tracking-tight text-ink group-hover:text-accent">
                    {c.title}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-ink-faint">
                    {c.domain} · {c.year}
                  </span>
                </span>
                <span className="font-mono text-[12px] leading-snug text-accent">
                  {c.results[0].metric}
                  <span className="mt-0.5 block text-[11px] text-ink-faint">{c.results[0].detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </DocSection>

      <DocSection id="how" title="How he works" note="each backed by something you can open">
        <ul className="grid gap-5 sm:grid-cols-2">
          {principles.map((p) => (
            <li key={p.title} className="border-l-2 border-accent pl-4">
              <p className="font-medium text-ink">{p.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{p.body}</p>
              <a href={p.evidence.href} className="mt-1 inline-block font-mono text-[11px] text-ink-faint underline underline-offset-2 hover:text-accent">
                evidence: {p.evidence.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection id="shipped" title="Shipped ledger">
        <ShippedArtifact />
      </DocSection>
    </DocShell>
  );
}
