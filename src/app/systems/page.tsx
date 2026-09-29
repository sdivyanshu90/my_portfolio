import type { Metadata } from "next";
import Link from "next/link";
import { DocShell } from "@/components/doc/doc-shell";
import { ScratchIndex } from "@/components/scratch-index";
import { counts, layers } from "@/data/portfolio";
import { spell } from "@/lib/words";

export const metadata: Metadata = {
  title: "Systems — the from-scratch index",
  description: `${counts.systems} working reimplementations of the modern AI stack — modeling, alignment, inference, retrieval and evaluation — each a readable repository.`,
  alternates: { canonical: "/systems" },
};

export default function Systems() {
  return (
    <DocShell
      current="/systems"
      wide
      eyebrow={`${counts.systems} systems · ${layers.length} layers`}
      title="The modern AI stack, rebuilt to understand it"
      lede={
        <p>
          Every row is a standalone repository. Most are study builds; the {spell(counts.engineered)} marked{" "}
          <span className="text-accent">⚙</span> are engineered libraries with tests and strict typing. These are the
          stars in the console&apos;s sky — the shipped, production work is on the{" "}
          <Link href="/work" className="text-accent underline underline-offset-4">
            work
          </Link>{" "}
          page.
        </p>
      }
      ask={["Show the inference & serving work", "Show the alignment & fine-tuning work", "How does he think about evaluation?"]}
    >
      <ScratchIndex />
    </DocShell>
  );
}
