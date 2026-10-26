# Portfolio content audit — 2026-10-26

## Public GitHub evidence

The complete paginated public PR search on 2026-10-25 returned 215 authored
upstream PRs: 28 merged, 104 open and 83 closed without merge. Owned repositories
are excluded. The search reported no incomplete results. Individual records are
preserved in `evidence/github-upstream-prs-2026-10-25.json`; the site consumes
`src/data/github-snapshot.json` for totals and repository counts.

| Repository | Authored | Merged | Open | Closed without merge |
|---|---:|---:|---:|---:|
| Mastra | 48 | 13 | 0 | 35 |
| EleutherAI lm-evaluation-harness | 49 | 4 | 45 | 0 |
| OpenCode | 45 | 1 | 9 | 35 |
| Experiential | 32 | 2 | 30 | 0 |
| Zulip | 1 | 1 | 0 | 0 |

The full snapshot includes all 14 repositories. The user API reports 202 public
repositories; owned non-fork repositories have 337 stars in total.

## Issue contributions

The public Mastra issue search identified 57 authored reports. Closure timelines
were checked on 2026-10-26: 40 have merged resolutions authored by others, 13 have
merged resolutions authored by Divanshu, two remain open, and two are closed
without a linked merged resolution. See `src/data/mastra-issues.json` for public
issue and resolution links. A closed issue alone is not counted as a verified fix.
Issue outcomes and authored PR merges overlap; they are not added together.

The existing 18 report → authored patch → other upstream fix examples were
rechecked. Their linked fixes remain merged. The public commit record for
Mastra #23091 includes Divanshu's co-author credit.

## Corrections

- Restored Founding Engineer at Uniiq.ai across current-role surfaces.
- Made the Admissions Decision Twin discoverable, with controlled offline
  evaluation scope and the supplied constraints, methodology and results.
- Replaced stale PR totals and duplicated console narratives with shared data.
- Added OpenCode's merged transport fix and Zulip's merged token-validation fix.
- Distinguished open PRs from closed, unmerged implementations everywhere.
- Added report contributions and public resolution evidence alongside PR counts.
- Removed the stale Mastra contributor ranking and OpenCode star count.
- Included contribution statuses in retrieval facts so count changes invalidate
  cached answers that depend on those facts.
- Corrected the résumé card's inaccurate one-page/May label and dated the PDF.
- Updated README inventory counts to 47 systems and eight case studies.

## Limits

The downloaded résumé PDF is still the two-page 2026-10-06 artifact. Its Founding
Engineer title is correct, but its old GitHub counts require regeneration. It is
explicitly dated in the UI; `/cv` contains the corrected current content.
Browser launch was denied by this execution environment, so PDF regeneration
and visual browser inspection remain unverified. No deployment was performed.

Uniiq's private engineering results are attributed to the supplied work summary,
not independently verified against public code. Other résumé-derived research
and career claims were checked for internal consistency, not re-established from
private institutional records.
