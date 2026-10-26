/** Reproducible, offline comparison with independently labeled real-JD excerpts. */
import { writeFileSync } from "node:fs";
import jobs from "../tests/fixtures/fit-real-jds.json";
import before from "../tests/fixtures/fit-before.json";
import { matchRequirement, matchRequirements } from "../src/lib/fit";

const results = jobs.flatMap((job) =>
  job.requirements.map((requirement) => ({
    job: job.id,
    company: job.company,
    split: job.split,
    url: job.url,
    requirement: requirement.text,
    expected: requirement.expected,
    rationale: requirement.rationale,
    before: before
      .find((b) => b.id === job.id)!
      .results.find((r) => r.text === requirement.text)!.strength,
    after: matchRequirement(requirement.text),
  })),
);
const summary = ["calibration", "holdout", "all"].map((split) => {
  const rows = results.filter((r) => split === "all" || r.split === split);
  return {
    split,
    requirements: rows.length,
    beforeAgreement: rows.filter((r) => r.before === r.expected).length,
    afterAgreement: rows.filter((r) => r.after.strength === r.expected).length,
    beforeFalseStrong: rows.filter(
      (r) => r.before === "strong" && r.expected !== "strong",
    ).length,
    afterFalseStrong: rows.filter(
      (r) => r.after.strength === "strong" && r.expected !== "strong",
    ).length,
  };
});
const report = {
  reviewedAt: "2026-10-26",
  stage:
    "Post-review regression: the original holdout was consumed during error analysis.",
  summary,
  parsing: jobs.map((job) => ({
    job: job.id,
    selectedRequirements: job.requirements.length,
    extractedRows: matchRequirements(
      job.requirements.map((r) => `- ${r.text}`).join("\n"),
    ).length,
  })),
  results,
};
if (process.argv.includes("--write"))
  writeFileSync(
    "docs/evidence/fit-benchmark-2026-10-26.json",
    JSON.stringify(report, null, 2) + "\n",
  );
console.table(summary);
for (const r of results.filter((r) => r.after.strength !== r.expected)) {
  console.log(
    JSON.stringify({
      job: r.job,
      split: r.split,
      text: r.requirement,
      expected: r.expected,
      actual: r.after.strength,
      reason: r.after.explanation,
      rationale: r.rationale,
    }),
  );
}

// Keep the one explicitly reviewed taxonomy disagreement visible. Do not relabel the reference set.
const unexpected = results.filter(
  (r) =>
    r.after.strength !== r.expected &&
    !(
      r.job === "spotlio-infrastructure" &&
      r.requirement.includes("managing and scaling AWS") &&
      r.expected === "verify" &&
      r.after.strength === "partial" &&
      r.after.needsVerification.length > 0
    ),
);
if (unexpected.length) process.exitCode = 1;
