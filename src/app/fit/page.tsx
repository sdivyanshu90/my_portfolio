import type { Metadata } from "next";
import { DocShell } from "@/components/doc/doc-shell";
import { FitPanel } from "@/components/fit-panel";
import { personal } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Fit check — match a job description",
  description: `Paste a job description and see, requirement by requirement, the evidence from ${personal.name}'s verified record — and the honest gaps. Runs in your browser.`,
  alternates: { canonical: "/fit" },
};

export default function Fit() {
  return (
    <DocShell
      current="/fit"
      eyebrow="Fit check · deterministic · private"
      title="Hold his record against your role"
      lede={
        <p>
          Paste a job description. See which requirements have supporting evidence, which are only partly covered, and which
          need verification. Required and preferred criteria stay separate; years, eligibility and production scope
          are checked explicitly. Review the linked evidence and explanations before drawing conclusions. It runs entirely in your browser;
          the text is never sent. Export the result as a one-page brief for your hiring team.
        </p>
      }
      ask={["Is he available, and for what roles?", "Show shipped systems with measured results", "How do I contact him?"]}
    >
      <FitPanel />
    </DocShell>
  );
}
