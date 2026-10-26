# Independent Astra review: real job requirements

Reviewed 2026-10-26. The fixture contains **12 real employer/ATS postings and 36 selected requirements**: eight calibration postings and four holdout postings. Labels were assigned from the dossier and source postings before reading or running the fit checker. This was one bounded review pass, with no model-driven relabeling to make checker results pass.

The evidence supports applied AI product work, Python/PyTorch implementations, TypeScript backend work and reliability contributions. It does not establish senior tenure, enterprise deployment scale, infrastructure operations breadth or employment eligibility. Those distinctions matter more than raw keyword overlap. These are requirement-level evidence judgments, not hiring recommendations or whole-job match percentages.

## Method and label contract

- **strong**: direct evidence covers the requirement at its stated scope. A project can be sufficient when the posting accepts project evidence or asks for familiarity; it does not establish production deployment or duration.
- **partial**: relevant components are supported but the complete technical combination or requested depth is not. Evidence for Python cannot satisfy an entire Python-plus-MLOps requirement by itself.
- **verify**: a decisive factual qualifier needs confirmation: role-specific years, deployment scope, operational scale, citizenship, work authorization or export-access eligibility. Relevant technology evidence does not remove the qualifier. This label is not a claim that the candidate satisfies it.
- **gap**: a named capability or credential is absent from the supplied record. This is an evidence gap, not proof that the person lacks the capability.

Each requirement is paraphrased, preserves conjunctions/alternatives and essential qualifiers, and excludes company introductions and benefits. Preferred/bonus criteria remain explicitly optional. The selected sample includes both positive evidence and hard limits; it is not a full transcription or exhaustive assessment of any vacancy. A whole-JD checker must still consider all unselected requirements.

The resulting label distribution is 14 strong, 8 partial, 11 verify and 3 gap. These labels are reasoned reference judgments from one independent model reviewer, not a consensus panel or objective ground truth. Borderline distinctions between partial and verify should be reviewed against their rationale rather than silently softened.

## Dossier provenance and interpretation

Evidence references use `path#symbol[entry]` as human-readable locators, not executable JSON pointers or browser anchors. The source record is `src/data/portfolio.ts`, with 2026-10-25 GitHub and Mastra snapshots in `src/data/github-snapshot.json` and `src/data/mastra-issues.json`.

The current role is **Founding Engineer at Uniiq.ai**, starting May 2026. That title demonstrates neither people-management scope nor a multi-year engineering tenure. Uniiq's platform work is supported by the supplied private engineering summary, not independently inspected source code. Its **Decision Twin is designed and validated in controlled offline evaluation**; the 30 scenarios and 60 artifacts must never become production user or deployment claims.

The GitHub snapshot reports 215 authored upstream PRs, of which 28 are merged, 104 open and 83 closed without merge. Mastra issue outcomes are separate: 13 resolved by the candidate's PRs and 40 by other authors. Reports resolved by maintainers support debugging and collaboration evidence but are not additional authored merged fixes. Sequre's four proposals are not four merged contributions. Neither count is evidence of years, leadership or operational scale.

Scratch implementations support their demonstrated concepts. Even entries described as hardened or production-grade do not prove actual production deployment. A listed cloud platform supports awareness but does not by itself establish running infrastructure. Residence is never used to infer citizenship or immigration status.

## Scoring pitfalls this set is intended to expose

1. Preserve **AND**: Twilio asks for ML tenure plus Python, a framework and NLP-library familiarity. Matching the technologies leaves the duration unverified. Ameba's two-year React/TypeScript-plus-OOP condition also keeps its duration.
2. Preserve **OR**: PyTorch can satisfy a PyTorch-or-TensorFlow clause. Air Apps permits a PostgreSQL-based alternative to Supabase; lack of the Supabase name alone is not a gap. Tenstorrent's bonus examples do not all need to be present.
3. Preserve **scope**: XPENG's production quantization/deployment criterion is not satisfied by a quantization repository or an external LLM API integration. Uniiq's frontend size improvement is not backend throughput evidence.
4. Preserve **optionality**: XPENG publications and Tenstorrent optimization topics are preferred/bonus. Palantir explicitly says highly available distributed-system experience and security-clearance eligibility are beneficial rather than necessary; those should not become hard gates simply because its technology list names Kubernetes and Kafka.
5. Preserve **unknown eligibility**: Accenture's citizenship restriction, Graphcore's no-sponsorship condition and Tenstorrent's export-access condition require actual facts. Technical fit cannot override them.
6. Preserve **provenance**: private work summaries, public project descriptions, authored PRs and merged changes have different evidentiary strength. Counts are not additive when issue resolutions overlap PRs.

## Calibration and holdout use

`split` is assigned by posting, not by requirement: the first eight postings are calibration; Spotlio, Palantir, Biti and Tenstorrent are holdout. Develop rules only against calibration, freeze the implementation, then evaluate holdout once. Report exact label agreement plus false-strong cases, split by calibration/holdout. Do not report a single favorable aggregate that hides unsupported strong labels. If holdout errors drive another change, this holdout is spent and subsequent scores must be described as post-review regression checks, not unseen validation.

This file makes no claim about current checker accuracy. The independent reviewer did not inspect checker output, change runtime code, or run paid provider inference. Source discovery and reading used bounded web searches, and only these two review artifacts were written in the repository.

## Source limitations and sources

All URLs below are employer-controlled ATS pages accessed on 2026-10-26. Greenhouse and Lever returned readable source pages. The five Ashby pages (OpenAI, Level, Ameba, Air Apps, Biti) returned detailed indexed primary-page text in search, while direct page opens exposed a JavaScript shell; their qualifications are based on that retrieved primary-page text. Indexed text may lag live edits. Vacancy availability and all posting contents can change; this fixture is a dated review sample, not an assurance the jobs remain open.

Air Apps has inconsistent location metadata: the title says Berlin, the listing header says Stockholm/remote, and the body says onsite Lisbon. The original title is retained; no location conclusion is scored. Other unselected details, such as German fluency for OpenAI's Munich role and location requirements elsewhere, remain outside this 36-requirement sample. No private messages were sent and no applications were submitted.

| Split | Employer | Posting |
| --- | --- | --- |
| calibration | OpenAI | [Applied AI Engineer, Digital Natives](https://jobs.ashbyhq.com/openai/d039c0ef-ab36-4d40-bc5e-5c70295b2eb7) |
| calibration | Level | [Applied AI Engineer](https://jobs.ashbyhq.com/level/473dba32-2fe2-43ca-8bd4-9aa41c249760/) |
| calibration | Accenture Federal Services | [Machine Learning Engineer](https://job-boards.greenhouse.io/accenturefederalservices/jobs/4722607006) |
| calibration | Graphcore | [Graduate Machine Learning Engineer 2027](https://job-boards.greenhouse.io/graphcore/jobs/8894041002) |
| calibration | Twilio | [Machine Learning Engineer](https://job-boards.greenhouse.io/twilio/jobs/7996774) |
| calibration | XPENG | [Staff Machine Learning Engineer - LLM Quantization & Deployment](https://job-boards.greenhouse.io/xpengmotors/jobs/8710020002) |
| calibration | Ameba | [Full-Stack Software Engineer](https://jobs.ashbyhq.com/ameba/360706a5-1a0a-4a60-9755-5d3ac6c306d6) |
| calibration | Air Apps | [Backend Engineer, Berlin](https://jobs.ashbyhq.com/airapps/a83155dd-2e5f-48eb-a72f-2e8d3ca0e5e9/) |
| holdout | Spotlio | [Infrastructure Engineer](https://jobs.lever.co/catalate/6a9aac86-0082-4402-873f-1f20a0b37d8b) |
| holdout | Palantir Technologies | [Backend Software Engineer - Infrastructure, Foundations](https://jobs.lever.co/palantir/fb2d3222-dbd8-4e03-8d39-47b820e9509c) |
| holdout | Biti Pro | [Backend Engineer](https://jobs.ashbyhq.com/biti/3b42b9ac-57d4-4701-bb92-92a08c28e8ef) |
| holdout | Tenstorrent | [Machine Learning Engineer, AI Models](https://job-boards.greenhouse.io/tenstorrent/jobs/4832276007) |
