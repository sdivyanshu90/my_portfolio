/**
 * Runs the router + guard evals and writes the scorecard the system card
 * publishes. Runs before every build (npm "prebuild"), so the live score is
 * always the score of the code that shipped. `--verbose` prints failures.
 */
import { writeFileSync } from "node:fs";
import { runEvals } from "@/lib/evals/run";

const card = runEvals();
const out = {
  router: card.router,
  guard: card.guard,
  at: new Date().toISOString().slice(0, 10),
};
writeFileSync(new URL("../src/data/eval-scorecard.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`router ${card.router.passed}/${card.router.total} · guard ${card.guard.passed}/${card.guard.total}`);
if (process.argv.includes("--verbose")) {
  for (const f of card.failures) console.log(`  ✗ ${f.q}\n      got ${f.got}\n      ${f.why.join("; ")}`);
}
