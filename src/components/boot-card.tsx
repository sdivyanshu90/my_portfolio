import { ArtifactView } from "@/components/console/artifacts";
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
      question="whoami"
      trace={[
        { step: "intent", detail: "about" },
        { step: "tool", detail: "get_about()" },
        { step: "synthesis", detail: "cached" },
      ]}
      narration={
        `DIV-1 online. It answers for Divanshu Sharma — a founding engineer who ships reliable AI products. Right now he leads the technical turnaround of Uniiq's AI advising platform; before that, privacy-preserving ML research at Yale and three years of quant research at WorldQuant BRAIN. The depth is public: ${counts.systems} from-scratch rebuilds of the modern AI stack. Each of the ${counts.stars} stars behind this card is one of his real systems — hover one, or ask anything and watch the answer assemble.`
      }
      footer={{
        model: "cached",
        ms: "0.0s",
        sources: [
          "résumé.pdf",
          "github/sdivyanshu90",
          "Uniiq engineering work summary (2026-07)",
        ],
      }}
    >
      <ArtifactView spec={{ kind: "about" }} />
    </CardShell>
  );
}
