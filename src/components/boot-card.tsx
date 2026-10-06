import { ArtifactView } from "@/components/console/artifacts";
import Link from "next/link";
import { CardShell } from "@/components/console/card";
import { counts } from "@/data/portfolio";

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
          href="/fit"
          className="border border-accent px-2 py-0.5 font-mono text-[11px] tracking-wide text-accent uppercase transition-colors hover:bg-accent hover:text-paper"
        >
          <span className="hidden min-[420px]:inline">hiring? </span>match your JD →
        </Link>
      }
      question="whoami"
      trace={[
        { step: "intent", detail: "about" },
        { step: "tool", detail: "get_about()" },
        { step: "synthesis", detail: "cached" },
      ]}
      narration={
        `DIV-1 online. It answers for Divanshu Sharma — a founding engineer who ships reliable AI products. His focus is LLM evaluation, inference and reliability. Right now he owns Uniiq's AI admissions platform — including a decision-planning layer that cut critical-constraint violations from 70% to 0% in offline evaluation; before that, privacy-preserving ML research at Yale and three years of quant research at WorldQuant BRAIN. The depth is public: ${counts.mergedUpstream} merged PRs to AI infrastructure like Mastra and EleutherAI's lm-evaluation-harness, and ${counts.systems} from-scratch rebuilds of the modern AI stack. Each of the ${counts.stars} stars behind this card is one of his real systems — hover one, or ask anything and watch the answer assemble.`
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
