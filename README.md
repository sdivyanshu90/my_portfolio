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

**Security:** a deterministic injection screen quarantines prompt-attack
queries before any model sees them (they get the sealed system card and a
*ward* animation instead); model identifiers are sanitized in the UI; the
narrator treats visitor messages as data, never instructions, and questions
about the console itself always get a fixed, handwritten answer. Per-IP
throttling on `/api/ask`.

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
OPENROUTER_MODEL=google/gemma-4-31b-it:free   # optional; chain falls back
```

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # static build + sitemap/robots/OG image generation
```

## License

MIT — see [docs/LICENSE](docs/LICENSE).
