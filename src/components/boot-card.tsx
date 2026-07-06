import { ArtifactView } from "@/components/console/artifacts";
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
      question="whoami"
      trace={[
        { step: "intent", detail: "about" },
        { step: "tool", detail: "get_about()" },
        { step: "synthesis", detail: "cached" },
      ]}
      narration={
        "DIV-1 online. It answers for Divanshu Sharma — a machine learning engineer who rebuilds the modern AI stack from first principles. Currently CTO at Uniiq; previously ML research at Yale and quantitative research at WorldQuant BRAIN. Each star behind this card is one of his real systems — hover one, or ask anything and watch the answer assemble."
      }
      footer={{
        model: "cached",
        ms: "0.0s",
        sources: ["résumé.pdf", "github/sdivyanshu90"],
      }}
    >
      <ArtifactView spec={{ kind: "about" }} />
    </CardShell>
  );
}
