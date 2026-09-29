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
          Paste a job description. Each requirement is matched against his verified dossier — with links to the
          evidence — and anything not on record is reported as a gap, not stretched. It runs entirely in your browser;
          the text is never sent. Export the result as a one-page brief for your hiring team.
        </p>
      }
      ask={["Is he available, and for what roles?", "Show shipped systems with measured results", "How do I contact him?"]}
    >
      <FitPanel />
    </DocShell>
  );
}
