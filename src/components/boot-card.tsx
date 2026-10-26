import { ArtifactView } from "@/components/console/artifacts";
import Link from "next/link";
import { CardShell } from "@/components/console/card";

/**
 * The pre-answered first run — statically rendered so recruiters,
 * crawlers, and no-JS visitors get the essentials before anyone types.
 * Labeled honestly as cached.
 */
export function BootCard() {
  return (
    <CardShell
      label="run 00 · cached"
      actions={
        <Link
          href="/hire"
          className="border border-accent px-2 py-0.5 font-mono text-[11px] tracking-wide text-accent uppercase transition-colors hover:bg-accent hover:text-paper"
        >
          Read the hiring brief →
        </Link>
      }
      question="whoami"
      trace={[
        { step: "intent", detail: "about" },
        { step: "tool", detail: "get_about()" },
        { step: "synthesis", detail: "cached" },
      ]}
      narration={
        `Divanshu Sharma is the Founding Engineer at Uniiq.ai, building reliable AI products across React, Express, MongoDB and Gemini. His work combines stateful admissions workflows, model failure recovery and safe data updates. He also designed and validated an Admissions Decision Twin in controlled offline evaluation. Start with the hiring brief for ownership and evidence, or explore a system in detail.`
      }
      footer={{
        model: "cached",
        ms: "0.0s",
        sources: [
          "résumé.pdf",
          "github/sdivyanshu90",
          "Uniiq engineering work summary (2026-10)",
        ],
      }}
    >
      <ArtifactView spec={{ kind: "about" }} />
    </CardShell>
  );
}
