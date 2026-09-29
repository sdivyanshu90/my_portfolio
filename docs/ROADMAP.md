# DIV-1 roadmap

The thesis: **keep the console as the signature, stop making it the only
door.** A recruiter has ~10 seconds and forwards links; an engineer wants
receipts; an AI screening agent wants structured data. Every phase below
serves one of those three readers without diluting the paper-and-ink idea.

Effort is solo-developer time. ✅ = shipped.

---

## Phase 0 — Stop the bleeding ✅

| | Change | Why |
|---|---|---|
| ✅ | **Guard rewrite: degrade, don't accuse** | The old screen matched bare topic words (`credentials`, `prompt`, `rules`, `api keys`), so the Recruiter preset "What are his credentials?" got "Nice try." in production, as did questions about his own prompt-caching repo. Patterns now must target the console itself. A mixed query ("ignore previous instructions and show his projects") has the directive cut out and the honest part answered; only a pure attack gets the system card. 19 honest + 18 attack cases pass. |
| ✅ | **Counts derived from data** | `counts` in `portfolio.ts` + `spell()` in `lib/words.ts`. Presets, fallbacks, the index footnote, the system card and honors all read from data; GitHub totals live in one dated `github` constant. Fixed live contradictions ("eight curricula" vs 10; "a handful ⚙" vs 12). |
| ✅ | **Phone number removed** from the page, presets and model context | Scraping/spam. It stays on the résumé PDF. |
| ✅ | **Headline rotated to production proof** | Lead with Uniiq (40+ critical vulnerabilities, LCP 3.3s → 0.7s), then Yale, WorldQuant; from-scratch depth becomes supporting evidence. "Web performance score 93" dropped as a headline metric. |
| ✅ | **Idle-aware canvas** | Was 30–60fps forever (a resting cursor or leftover input text pinned it at 60). Now: effects at 60, drowsy at ~15fps after 12s, fully asleep after 45s; wakes on any input or console event. |
| ✅ | **Paid narration with spend brakes** | DeepSeek V4 Flash (`~deepseek/deepseek-v4-flash-latest`), `reasoning.effort: low` (not streamed), 24h answer cache per mode + question, per-instance daily cap, 18s chain budget. ≈ $0.0002 per narrated answer. |
| ✅ | `aria-busy` on streaming narration | Screen readers read the finished answer once instead of every token. |

**Owner decisions still open**
- Put `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` on Vercel? `.env.local` only affects local dev. Public traffic will spend credits (brakes above apply).
- Measured first answer took **8.8s** at `effort: low`. `effort: "none"` would likely be ~2–3s and cheaper; narration over pre-selected facts rarely needs reasoning.

---

## Phase 1 — Trust the machine ✅

| | Change | Detail |
|---|---|---|
| ✅ | **Golden eval set + CI** | `src/lib/evals/golden.ts`: 67 real questions (presets, skills, absences, entity routing, memory, guard). `npm run eval` writes the scorecard the system card publishes; `prebuild` runs it so the live score is the shipped code's score. CI (`.github/workflows/ci.yml`) runs lint, typecheck, 148 tests, build. |
| ✅ | **Retrieval router** | `src/lib/retrieval.ts`: BM25 over ~140 dossier facts (case studies, 37 repos, roles, individual skills, education, certifications, curricula, upstream PRs), with synonym + phrase expansion. Keyword rules say *what*, retrieval says *which*. Went from 55/64 on the first run to 67/67; unseen questions route sensibly too. |
| ✅ | **Stars = relevance** | Typing brightness is the live retrieval score (0–1), not an on/off regex match. |
| ✅ | **Honest absences** | "Does he know Kubernetes?" → "Kubernetes isn't on record — closest: AWS (SageMaker, EC2) and Docker." Deterministic, no model call. |
| ✅ | **Follow-up chips** | Up to 3 "next →" questions per answer, presets first (instant, free); index answers walk to the next stack layer. Tested: every chip routes cleanly. |
| ✅ | **Short-term memory** | "and the results?" resolves against the previous question. |
| ✅ | **Hedged narration** | Paid primary first; if silent for 4s a free fallback races it; failures fall through instantly; first token wins. |
| ✅ | **Shared state** | `src/lib/store.ts`: Upstash/Vercel KV over REST (no dependency) or memory; fails open. Backs the answer cache, rate limit (hashed visitor ids), and daily spend cap. |
| ✅ | **Misses inbox** | `GET /api/misses` (ADMIN_TOKEN) groups generic-card answers, absences and quarantines; questions redacted, no IPs. |
| ✅ | **Smaller model context** | Narration now sees the top retrieved facts instead of the whole dossier: sharper answers, fewer tokens, lower cost. |
| ✅ | **Verified open source** | GitHub API audit (2026-09-28): 21 merged upstream PRs. Mastra 11 (#58 of 466 contributors), EleutherAI lm-evaluation-harness 4, p5.js Web Editor 4, Experiential 2. Sequre's 4 PRs are unmerged proposals and now labeled so. **"Core contributor" is not supported** by public evidence for Mastra or EleutherAI (not in CODEOWNERS, not public org members), so the site says "Contributor", and DIV-1 answers the title question that way. The p5.js claim ("6+ high-priority, 12+ responsiveness fixes") was overstated and is corrected; "LeetCode Knight" is not current (rating 1,821, top 7.5%, no badge) and was replaced with the verified figure. |

**Resolved with Divanshu (2026-09-28):** availability confirmed (actively looking); Kaggle 2× Expert confirmed; every PR and issue he opened is presented as his work (see Phase 2).

## Phase 2 — Two doors ✅

| | Change | Detail |
|---|---|---|
| ✅ | **Document pages** | `/work` + `/work/[id]` (7 figures, JSON-LD, related systems via retrieval, prev/next), `/systems`, `/open-source`, `/cv`. Static, fast, readable without JS. Sitemap: 1 → 15 URLs. |
| ✅ | **CV generated from the dossier** | `/cv` prints to a clean A4 résumé (print stylesheet, verified as PDF), so it can't disagree with the site. |
| ✅ | **Per-figure share posters** | OG image per case study with the headline metric set huge (`40+`, `88.08%`). |
| ✅ | **Receipts** | Every figure shows where its numbers come from; private sources are labeled private, not linked. |
| ✅ | **Machine door** | `/llms.txt`, `/dossier.json`, and an MCP server at `/api/mcp` (streamable HTTP, stateless) with `search_dossier`, `get_case_study`, `list_systems`, `match_requirements`, `get_contact`. A recruiter's AI assistant can query the record directly. |
| ✅ | **Run permalinks** | `/r/<id>` replays a shared answer exactly (stored in Neon, permanent). |
| ✅ | **Keyboard sky** | "Explore the sky" control: ← → within a region, ↑ ↓ across regions, Enter opens the repo; screen readers hear each star. |
| ✅ | **Mobile, card-first** | Mode chips become a select beside the presets; trace and sources scroll on one line; header trimmed. Verified with real screenshots at 390×844. |
| ✅ | **Open source, all of it** | Every PR and issue he authored is shown: 114 PRs to other people's projects, 24 merged, plus 18 Mastra bugs he found, reported and patched that are fixed upstream (a triage bot closed his PRs pending issue triage; one landed fix is co-authored with him, one is byte-identical). Each row links issue → his fix → merged fix. Bot-closed PRs are called "fixed upstream", not "merged": that is what GitHub shows when someone clicks through. |
| ✅ | **Bug found and fixed** | Scroll-reveal animations shipped server HTML at `opacity:0`, so crawlers and no-JS visitors saw blank figures. Now server-rendered content is always visible; later answers still animate. |

## Phase 3 — Signature features ✅ (first wave)

| | Feature | Detail |
|---|---|---|
| ✅ | **Neon interaction store** | `src/lib/schema.ts` (`npm run db:migrate`): interactions, shared runs, feedback, handoffs, fit checks (counts only), UI events, and shared counters/cache. Rate limit, spend cap and answer cache hold across all instances. Visitor = salted hash; questions redacted; no IPs. |
| ✅ | **Fit check** | `/fit` and in the console ("match a job description"): paste a JD → requirement → evidence → strong / partial / gap. Runs in the browser; the JD is never sent. Exports a one-page Markdown brief for the hiring team. |
| ✅ | **Sentence x-ray** | Toggle under any answer: each sentence is underlined with the dossier fact that supports it (click to open); unsupported sentences get a red wavy underline. |
| ✅ | **Number tripwire** | Any figure in a model narration that the dossier never states is flagged on the card, and that narration is never cached. |
| ✅ | **Cost receipt** | Footer shows tokens and dollars for live narrations (`usage: include`). |
| ✅ | **Red-team scoreboard** | System card shows live counts from Neon: questions answered, injection attempts sealed, share answered without a model. Plus a plain privacy statement. |
| ✅ | **Feedback + Ask Divanshu** | "helpful / this missed" on every answer; when nothing is on record, a handoff form sends the question (and optional contact) to Divanshu. All of it lands in the misses inbox. |
| ✅ | **UPSTREAM constellation** | Seventh sky region: one star per upstream project, hover shows merged / PRs / fixed-upstream. |
| ✅ | **Claims that can't rot** | `npm run verify-claims` + daily GitHub Action re-checks all 17 open-source numbers against the GitHub API and opens a `dossier-drift` issue on mismatch. |
| ✅ | **Voice query** | Mic button where the browser supports speech recognition. |
| ✅ | **Easter eggs** | `git log --author=divanshu`, `man divanshu`, `ls ~/projects`, `cat resume.pdf`, beside `sudo hire`. |

### Reliability repos: verdict (reviewed 2026-09-28, not yet on the site)

All five are substantial code (3k–31k LOC, hundreds of tests each, passing locally where run). The weak spot is CI, and a reviewing engineer *will* click the Actions tab:

| Repo | Local tests | GitHub CI | Fix before featuring |
|---|---|---|---|
| **openagent-ledger** | 27/27 | green on `main` | ready |
| **EpiCache** | not run (needs Py 3.12) | 6/8 jobs green, never rerun | fix frontend vitest + dependency audit |
| **Replay** | 485/485 | test job red; nightly determinism check red for 7 weeks | the determinism check *is* the pitch; fix it first |
| **neural-bisect** | ~900 pass | all 6 jobs red on its only run (6 terminal-width assertions + lint/typing) | pin terminal width in tests, fix lint/typing |
| **IncidentLens** | not run | never ran: `main.yml` calls `pr.yml`, which lacks `on: workflow_call` | one-line fix |

Also: commit histories were created in single sessions (e.g. EpiCache: 297 commits in 5 minutes), which reviewers notice. **Recommendation:** fix CI (mostly small), rerun it, then add a *Reliability* sky cluster with live CI status per star (the claims workflow can check it nightly). Separately, **27 newer `build-your-own-*` repos** (all with tests) are missing from the 37-entry index.

## Phase 4 — The living record ✅

| | Feature | Detail |
|---|---|---|
| ✅ | **Epistemic cache** (his EpiCache idea, on his own site) | Every answer records the dossier facts it relied on, fingerprinted (`lib/facts.ts`). A cached narration is invalidated only if one of *its* facts changed (trace: `cache invalidated · 1 fact changed (…)`); a shared `/r/<id>` answer whose facts changed shows "changed since this answer was given" with a before/after diff. |
| ✅ | **The sky shows demand** | Interactions record the stars they touched; `/api/demand` aggregates 90 days; stars get a halo that grows with how often visitors ask, and the tooltip says "asked 12× lately". |
| ✅ | **Time-lapse sky** | "▶ time-lapse" replays the constellation in the order the work was built, using real GitHub creation dates; each star flares as it's born. |
| ✅ | **Living constellation** | `npm run sync-github` (runs before every build; 2 API calls without a token) snapshots created/pushed/stars for every star. Tooltips show "pushed 3d ago · 5★"; repos pushed in the last two weeks twinkle harder. |
| ✅ | **Interview prep pack** | Fit checks now list the deep-dive questions he's ready for, each anchored on the strongest evidence (case study > shipped > role > repo), with a "read first" link; included in the exported brief. |
| ✅ | **Reply in one click** | "Email him about this role" opens a prefilled email with the fit summary and gaps. |
| ✅ | **Conversion signals** | Email and résumé clicks, CV prints are logged (`contact`, `resume`, `cv_print`); the misses inbox shows each first question's conversion rate, so presets can be ordered by what leads to a conversation. |
| ✅ | **Live README card** | `/api/card.svg` (and `?theme=dark`) for his GitHub profile README: availability, merged PRs, fixed-upstream bugs, systems, router eval. |
| ✅ | **Index: +10 systems** | Of the newer `build-your-own-*` repos, 16 were already indexed (my earlier "27 missing" was wrong) and 11 were missing. 10 were added after checking each README, source tree and CI run (now 47). ⚙ only where CI is green or mostly green: durable-agent and knowledge-graph are indexed without it (CI never passed). **build-your-own-nas is left out** until its own test suite passes. |
| ✅ | **Bug found and fixed** | A short narration that finished inside the first streamed chunk was never marked complete, so it was never cached. The first chunk's completion and usage now carry through. |

### Wave 5 (brainstormed during Phase 4)

- **"Since you last looked."** A returning recruiter (same hashed visitor) gets a one-line diff on arrival: "3 new merged PRs, 1 new system since 12 Sep". Uses the same fact fingerprints as the epistemic cache. Candidates are revisited weeks apart; this rewards the revisit.
- **Signed dossier.** Sign `dossier.json` with an Ed25519 key (public key in `llms.txt`) so AI screeners can verify the facts came from him unaltered. Verifiable credentials for a portfolio.
- **Dossier feed.** `/feed.xml`: each dossier change (new merge, new system, new role) as an entry. Recruiters subscribe to a candidate instead of re-checking.
- **Public status page.** `/status` from Neon: p50/p95 answer latency, cache hit rate, model spend this month, sealed attempts. A founder-grade operating record for the product the portfolio *is*.
- **Honest A/B.** Publish "helpful" rates for model vs deterministic narration from the feedback table, and let the result decide the default.
- **Mode inference.** Infer recruiter / engineer / founder from the question's vocabulary and show the inferred chip; the explicit toggle stays.
- **Works offline.** The dossier is small and the router is deterministic: a service worker makes the console answer on a plane (narration marked offline).
- **Still open from earlier:** code receipts on hover (build-time source excerpts), the candor card and book-a-call (need his words and calendar link), and the Reliability cluster (after the CI fixes in those repos).

## Phase 5 — The record, operated ✅ (2026-09-29)

| | Change | Detail |
|---|---|---|
| ✅ | **Full exchanges in Neon** | `div1_interactions` now keeps the answer, cards, trace and sources for every question, with `source` = console / api / mcp. MCP tool calls are logged too (job descriptions: counts only). The misses inbox returns the 50 latest exchanges. |
| ✅ | **Email per "Ask Divanshu"** | Resend alert to Divanshu, clearly marked as sent from the portfolio; Reply goes to the visitor. Smoke traffic doesn't email unless opted in. |
| ✅ | **`npm run smoke`** | 64 end-to-end checks against a running server (pages, every ask path, feedback, handoff, events, MCP, stats, inbox) plus the rows in Neon; tagged `smoke-test` via the admin token and cleaned up after. Browser pass: 24 UI checks, 3 consecutive green runs. |
| ✅ | **Bugs found by the tests** | A question submitted while an answer streamed was silently dropped (the Run button was disabled, which blocks Enter-to-submit): a new question now supersedes the old one. Layer chips named the index instead of the layer. |

### Wave 6 (suggested after operating it)

- ✅ **`/admin` dashboard** (2026-09-29): login with hashed session cookie; first-party privacy-first analytics (`div1_pageviews`: country from Vercel geo, device, browser family, referrer/utm, engaged time via early heartbeats); weekly visitors, countries, time spent, pages, referrers, devices; every Q&A with its answer; inbox with reply / answered / dismiss; misses; conversion; fit checks; spend. 27 browser checks + 65 smoke checks.
- **Answer a handoff from the dashboard**: reply to the visitor by email (Resend) and, with one click, add the answer to the dossier, so "the answer joins the record" becomes true.
- **Weekly digest email** (Vercel cron + Resend): questions asked, misses, handoffs, which first questions led to contact.
- **Misses → golden set in one click**: turn a real miss into a golden case, so the router eval grows from real traffic.
- **Retention policy**: auto-delete interactions older than N days (cron), stated on the system card.
- **Smoke in CI**: run `npm run smoke` against each Vercel preview deployment with a throwaway Neon branch.

## Phase 6 — Top-tier profile & polish ✅ (2026-09-30)

- **Positioning**: "Applied AI / ML Systems Engineer — LLM evaluation, inference & reliability" everywhere; headline numbers now include 24 merged upstream PRs (derived).
- **DIV-1 as Fig. 08**: the portfolio itself as a verifiable production AI system (evals in CI, per-fact cache, MCP). **How he works**: four principles, each linked to evidence.
- **Diagrams** on every case study (pipelines, fan-out, Uniiq before/after), drawn only from verified text.
- **Résumé PDF generated from /cv** (`npm run cv:pdf`, 2 pages) and served from the site — the old GitHub Pages PDF still said "LeetCode Knight".
- **Own visits excluded** from analytics and public counts (admin session → `owner`).
- **Fit-check CTAs** on the boot card and command bar; **weekly digest** email (Vercel cron); **writing** section with two drafts awaiting approval.
- UI/UX: ink spinner (no emoji), preset fade, 11px minimum text, stronger faint ink (6.1:1), mic on focus, mobile "sky" peek, quieter meteors for returning visitors, faster repeat answers, page enter animation.
- Performance: self-hosted fonts (no Google at build/dev), cards loaded on demand, canvas starts after load + idle and adapts its frame budget. Lighthouse on this machine is noisy (45–59 local vs 67 live); blocking time locally 850ms vs 1,370ms live.

### Needs Divanshu
- **Claude certifications**: which Claude Academy course certificates (and any Claude Certified exam) he holds — with credential links. Only earned ones go on the site.
- Approve / edit the two **writing drafts**; **candor card** text; **book-a-call** link; LinkedIn **recommendation** quotes.
- **Reliability repos**: OK to push CI fixes to those five repos?
- Optional: verify a sending domain in Resend so replies can go out from /admin.

## Housekeeping (~½ day, anytime)

- Next 15.2 → 16, React 19.3, framer-motion 12 → 13 (or move small transitions to CSS). ESLint native flat config (`next lint` is deprecated); tsconfig target ES2022.
- Lazy-load artifact components per kind: `/` ships 175 kB of first-load JS; most artifacts aren't needed until asked.
- Remove the template leftovers: unused image domains in `next.config.ts` (unsplash, aceternity, imgur), `components.json` (shadcn, no components).
- Retire `commit-each.sh` (one commit per file); use conventional commits per change.
