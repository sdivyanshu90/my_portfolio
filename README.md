# DIV-1 — an AI-native portfolio

> **One screen. No scrolling. Ask, and watch the answer assemble.**
> DIV-1 presents Divanshu Sharma as a queryable model on a single
> non-scrolling stage: behind the answer card hangs a constellation in which
> **every star is one of his real systems** — 37 from-scratch repos clustered
> by stack layer plus 7 case studies. Type a question and the relevant stars
> begin to glow; run it and they converge into the answer.

**Live:** [https://div90.vercel.app/](https://div90.vercel.app/)

## Why this isn't another portfolio chatbot

The 2026 "AI portfolio" genre is a chat bubble over a résumé. DIV-1 is an
**inference stage with generative UI**:

| | Chat-bubble portfolios | DIV-1 |
|---|---|---|
| Surface | a scrolling page + widget | **one viewport**: constellation, answer card, command bar |
| Answers | prose | **typed artifacts** — case-study figures, the filterable from-scratch index, an experience changelog, capability matrix, contact cards — composed per query |
| The background | decoration | **the data**: every star is a real repo — hover names it, click opens it, answers visibly condense from the stars they cite |
| Mechanism | hidden | **transparent trace**: `intent → get_index(Inference & serving) → synthesis: <model> · 1.8s` + provenance chips |
| Audience | one-size | **modes** — Recruiter / Engineer / Founder swap presets & tone |
| Model down | dead site | **fully functional** — deterministic router renders exact artifacts; narration falls back honestly |
| First paint | empty chat | **pre-answered `whoami` boot card** (statically rendered) with key results & contact chrome |

Aesthetic: the genre default is neon terminal; DIV-1 is a **hand-drawn star
chart on paper** — warm paper, iron-gall ink, rubrication red, Newsreader +
IBM Plex Mono — with a *microfiche* dark mode.

**The animation system** (bounded, adaptive 30/60fps, fully
`prefers-reduced-motion`-safe): constellation ignition · drift, cluster
breathing, twinkle, shooting stars · pointer parallax · typing-stir with
live constellation threads · the signature **astrolabe sweep** (a scan ring
sweeps the sky when a run starts) · **ink comets** flying the cited stars
into the card, which ripples on impact and **typesets itself** in a cascade
· dismiss-sparks · a circular **ink-flood theme wipe** (View Transitions) ·
odometer count-ups, staggered rows, sliding ink chips, input shake, blinking
caret. Try `sudo hire` — and press `/` anywhere to focus the prompt.

**Security:** a deterministic injection screen catches directives aimed at
the console itself ("ignore previous instructions", "your system prompt",
"this site's API key") and seals narration for that run — the query never
reaches a model. It degrades rather than accuses: whatever else the question
asked about Divanshu still renders as exact artifacts, and only a pure attack
gets the system card and the *ward* animation. Topic words alone never trip
it (his credentials, his prompt-caching repo, API-key handling). Model
identifiers are sanitized in the UI; the narrator treats visitor messages as
data; per-IP throttling on `/api/ask`.

## Architecture

```
question ──▶ /api/ask ──▶ deterministic intent router (multi-intent regex)
                           ├─ trace events            (NDJSON stream)
                           ├─ artifact specs ──▶ client renders from local dossier
                           │                     └─ stars converge (canvas field)
                           └─ narration: OpenRouter chain (12s first-token
                              deadline per model) → else handwritten fallback
```

- **Next.js 15** App Router; static shell (Lighthouse a11y 100, CLS 0, FCP 0.8s)
- **`src/data/portfolio.ts`** — single typed dossier; every fact traces to the
  résumé PDF, GitHub, or repo READMEs; unverified fields carry a `placeholder` mark
- **`src/lib/intents.ts`** — router + provenance map + fallback narrations
- **`src/components/console/field.tsx`** — the constellation (canvas, 30fps
  cap, lazy-loaded, static under reduced motion)
- **Tailwind CSS v4** tokens · **framer-motion** · **next-themes** · zero AI-SDK deps

## Configuration

Narration uses OpenRouter (optional — the console works without it):

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=~deepseek/deepseek-v4-flash-latest  # primary; free models are the hedge chain
NARRATION_DAILY_CAP=300      # optional; narrations per UTC day
NARRATION_HEDGE_MS=4000      # optional; silence before a free fallback races the primary

# Neon Postgres — the interaction store (questions, shared runs, feedback,
# handoffs, fit-check counts, UI events) and shared rate limit / cache.
DATABASE_URL=postgres://...   # or NeonDB_URI; then run `npm run db:migrate` once

# Optional: Upstash Redis or Vercel KV for faster counters/cache (else Neon).
UPSTASH_REDIS_REST_URL=...   # or KV_REST_API_URL
UPSTASH_REDIS_REST_TOKEN=... # or KV_REST_API_TOKEN
IP_SALT=...                  # salts the hashed visitor id used for rate limiting
RESEND_API_KEY=re_...        # emails Divanshu each "Ask Divanshu" question (Resend)
NOTIFY_EMAIL=...             # optional; alert recipient (default: the dossier email)
NOTIFY_FROM=...              # optional; sender on a verified domain (default: onboarding@resend.dev)
ADMIN_TOKEN=...              # enables GET /api/misses (Authorization: Bearer …)
```

Spend controls for paid models: presets, honest absences, canonical chips and
guarded queries never call a model; finished narrations are cached for 24h per
mode + question; reasoning runs at `effort: low` and is never streamed; past the
daily cap every run is deterministic. A typical narration costs ≈ $0.0002.

**Routing.** Keyword rules name *what* the visitor wants; BM25 retrieval over
every dossier fact (`src/lib/retrieval.ts`) finds *which* repo, case study, role
or skill. The same scores light the stars while you type. Named tech with no
trace in the dossier gets an honest "not on record" with the closest neighbours.

**Evals.** `src/lib/evals/golden.ts` is the router's golden set;
`npm run eval` scores it (plus the injection-screen cases) and writes
`src/data/eval-scorecard.json`, which the system card publishes. It runs before
every build, so the live score is the score of the shipped code.

**What's stored.** Every question — from the site's console, a direct `POST /api/ask`, or an AI
agent over MCP (`source` = console | api | mcp) — lands in `div1_interactions` with the answer DIV-1 gave,
the cards shown, the run trace and sources. Questions are redacted; job descriptions are never stored.

**Weekly digest.** `vercel.json` schedules `/api/cron/digest` for Mondays 03:00 UTC: an email with the
week's visitors, countries, sources, questions, misses and open inbox. Set `CRON_SECRET` on Vercel (Vercel
sends it as a Bearer token); `ADMIN_TOKEN` also works for a manual send.

**Writing.** `src/data/writing.ts` — posts stay drafts (`published: false`, visible only when signed in to
/admin) until approved.

**Admin dashboard.** `/admin` (sign in with `ADMIN_TOKEN`; the session cookie holds a hash, never the
token): unique visitors with period-over-period change, weekly visitors (12 weeks), countries, time spent
per session, top pages, referrers / utm, devices & browsers, every question with its answer, the "Ask
Divanshu" inbox (reply / mark answered / dismiss), misses, conversion by first question, fit checks and
model spend. Page analytics are first-party and privacy-first: no IPs or user agents stored, country from
Vercel's geo header, engaged (tab-visible) time only, bots skipped, Do-Not-Track / GPC honored.

**Misses inbox.** `GET /api/misses?days=14` (Bearer `ADMIN_TOKEN`) returns, from
Neon: generic-card answers, "not on record" answers and quarantines (grouped),
answers visitors flagged as missed, open "ask Divanshu" handoffs, the most asked
questions, and fit-check totals. Questions are redacted; no IPs are stored.

**Pages & machine door.** `/work`, `/work/<id>`, `/systems`, `/open-source`,
`/cv` (prints as the résumé), `/fit` (job-description matcher, runs in the
browser), `/r/<id>` (shared answers). For AI screeners: `/llms.txt`,
`/dossier.json`, and an MCP server at `/api/mcp` (tools: `search_dossier`,
`get_case_study`, `list_systems`, `match_requirements`, `get_contact`).

**README card.** Embed a live card on the GitHub profile:

```md
[![DIV-1](https://div90.vercel.app/api/card.svg)](https://div90.vercel.app)
```

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # golden router set, guard, retrieval, store, credit-safety route tests
npm run eval   # print the router scorecard (-- --verbose lists failures)
npm run build  # eval scorecard + static build + sitemap/robots/OG image generation
npm run db:migrate     # apply src/lib/schema.ts to Neon (idempotent)
npm run verify-claims  # re-check open-source numbers against GitHub (GITHUB_TOKEN)
npm run sync-github    # refresh src/data/activity.json (runs before every build)
npm run cv:pdf         # print /cv to public/Divanshu_Sharma_Resume.pdf (BASE + CHROME_PATH; running server)
npm run smoke          # end-to-end check of every page/API + the Neon rows (needs ADMIN_TOKEN, a running server)
                       #   BASE=http://localhost:3100 npm run smoke -- [--live] [--email] [--keep]
```

## License

MIT — see [docs/LICENSE](docs/LICENSE).
