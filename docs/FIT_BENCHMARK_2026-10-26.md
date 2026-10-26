# Fit checker review — 26 October 2026

The checker now distinguishes supported evidence, partial coverage, facts to verify, and absent evidence. It recognizes exact skills without a minimum BM25 score, handles explicit alternatives separately from conjunctions, retains experience/scope qualifiers, and separates required from preferred criteria. Explanations and evidence scope appear in the UI, Markdown brief and MCP response. Matching remains local and incurs no model calls.

## Bounded real-JD evaluation

GPT-6 Astra independently researched **12 employer/ATS postings** and labeled **36 selected, paraphrased requirements** against the portfolio before seeing checker output. Sources, reference reasoning and limitations are in [the independent review](FIT_ASTRA_REVIEW.md) and [the fixture](../tests/fixtures/fit-real-jds.json). This is not a full assessment of all requirements in all twelve vacancies.

Eight postings (24 requirements) were calibration; four postings (12 requirements) were initially held out. The first holdout exposed missing general engineering concepts, a PostgreSQL/data-modeling false positive, and a long alternatives-list parsing error. Those errors drove one correction pass. The holdout is therefore **consumed**: final scores describe regression agreement, not unseen accuracy.

| Stage | Calibration agreement | Original holdout agreement | Unsupported strong labels |
| --- | --- | --- | --- |
| Original checker | 5/24 | 2/12 | 1/36 |
| First evaluation after calibration | 24/24 | 5/12 | 1/36 |
| Final, after error review | 24/24 | 11/12 | 0/36 |

Final agreement is **35/36**. Reference labels were not changed. The old checker had no `verify` label, so agreement is not a like-for-like three-class accuracy comparison. It produced 2 strong, 27 partial and 7 gap rows. The final checker produces 14 supported, 9 partial, 10 verify and 3 without evidence. All 14 supported results agree with Astra on this small selected set.

The remaining disagreement concerns broad AWS infrastructure operations: Astra says **verify** because ownership/scale need confirmation; the checker says **partial** because AWS/Docker evidence exists but Redis is absent. The explanation also explicitly requests scope verification. Keeping this conservative difference is preferable to hiding missing evidence or changing the reference label.

## What the profile actually supports

- Direct evidence: Python/PyTorch implementations, Node.js/TypeScript and React product work, Uniiq structured outputs and recovery, evaluation methodology, defensive coding, and public Git collaboration.
- Partial evidence: broad MLOps stacks, production retrieval pipelines, cloud infrastructure operations, backend performance and database-modeling depth.
- Needs verification: role-specific years, enterprise/production scale, people responsibility, citizenship, work authorization and availability. Founding Engineer is not evidence of management tenure.
- Absent in the selected sample: infrastructure-as-code tooling, blockchain/Web3 integration and research publications. The publications requirement is preferred, not a hard gate. Absence from the portfolio is not proof of inability.

The Admissions Decision Twin remains an offline design/evaluation. It supplies evaluation evidence, not production-deployment evidence. Uniiq's private engineering summary and public repository/issue evidence retain their existing provenance; this work does not independently verify private code or invent outcomes.

## Reproduction and limits

Run `npm run eval:fit` for the offline regression. `-- --write` regenerates [the detailed report](evidence/fit-benchmark-2026-10-26.json). [The first holdout report](evidence/fit-first-holdout-2026-10-26.json) and [original checker outputs](../tests/fixtures/fit-before.json) are preserved. The command fails on unexpected label disagreements; the documented AWS partial/verify difference is explicit.

Validation: 241 tests pass, including 28 fit tests; lint and TypeScript pass. A browser visual check was unavailable in this environment. No paid provider inference was used by the checker or benchmark.

This is a deterministic, curated-concept heuristic. Unknown technologies, implicit alternatives, negation, degree-field restrictions and complex prose can still need manual interpretation. The parser is tested separately; the 36-label benchmark evaluates selected requirement text, not extraction accuracy on complete original postings. No whole-role fit percentage or hiring probability is reported. One model's labels are a reference review, not objective ground truth; 35/36 must not be presented as general accuracy.
