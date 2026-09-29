-- DIV-1 interaction store (Neon Postgres). Idempotent: `npm run db:migrate`.
-- Privacy: no IPs or user agents anywhere. `visitor` is a salted SHA-256
-- prefix; questions are redacted (emails, numbers, URLs) before insert; job
-- descriptions pasted into the fit matcher are never stored — only counts.

-- Every question asked of the console.
CREATE TABLE IF NOT EXISTS div1_interactions (
  id          bigserial PRIMARY KEY,
  at          timestamptz NOT NULL DEFAULT now(),
  visitor     text,
  question    text NOT NULL,
  mode        text NOT NULL,
  path        text NOT NULL,           -- preset | cached | model | deterministic | guarded
  kinds       text[] NOT NULL DEFAULT '{}',
  retrieved   text[] NOT NULL DEFAULT '{}',
  absent      text[] NOT NULL DEFAULT '{}',
  miss        boolean NOT NULL DEFAULT false,
  ms          integer NOT NULL,
  model       text,
  tokens      integer,
  cost_usd    numeric(12, 8),
  run_id      text,
  has_prev    boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS div1_interactions_at ON div1_interactions (at DESC);
CREATE INDEX IF NOT EXISTS div1_interactions_miss ON div1_interactions (at DESC) WHERE miss;

-- Shared answers: /r/<id> replays these exactly.
CREATE TABLE IF NOT EXISTS div1_runs (
  id       text PRIMARY KEY,
  at       timestamptz NOT NULL DEFAULT now(),
  payload  jsonb NOT NULL
);

-- "This answer missed" / "helpful" flags on answer cards.
CREATE TABLE IF NOT EXISTS div1_feedback (
  id        bigserial PRIMARY KEY,
  at        timestamptz NOT NULL DEFAULT now(),
  visitor   text,
  run_id    text,
  question  text NOT NULL,
  verdict   text NOT NULL CHECK (verdict IN ('missed', 'helpful')),
  note      text
);

-- Questions DIV-1 couldn't answer, handed to Divanshu.
CREATE TABLE IF NOT EXISTS div1_handoffs (
  id        bigserial PRIMARY KEY,
  at        timestamptz NOT NULL DEFAULT now(),
  visitor   text,
  question  text NOT NULL,
  contact   text,
  note      text,
  status    text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'answered', 'dismissed'))
);

-- Job-description fit checks: counts and gap topics only, never the JD.
CREATE TABLE IF NOT EXISTS div1_fit_checks (
  id            bigserial PRIMARY KEY,
  at            timestamptz NOT NULL DEFAULT now(),
  visitor       text,
  requirements  integer NOT NULL,
  strong        integer NOT NULL,
  partial       integer NOT NULL,
  gap           integer NOT NULL
);

-- Lightweight UI events (mode switch, share, sky explored, x-ray, voice…).
CREATE TABLE IF NOT EXISTS div1_events (
  id       bigserial PRIMARY KEY,
  at       timestamptz NOT NULL DEFAULT now(),
  visitor  text,
  name     text NOT NULL,
  detail   jsonb
);
CREATE INDEX IF NOT EXISTS div1_events_name_at ON div1_events (name, at DESC);

-- Shared counters/caches when no Redis is configured (rate limit, spend cap,
-- answer cache). Expired rows are swept opportunistically.
CREATE TABLE IF NOT EXISTS div1_kv (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  expires_at  timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS div1_list (
  id     bigserial PRIMARY KEY,
  key    text NOT NULL,
  value  text NOT NULL
);
CREATE INDEX IF NOT EXISTS div1_list_key ON div1_list (key, id DESC);

-- v2: which stars (repos / case studies / upstream projects) each answer
-- touched — the sky glows by demand.
ALTER TABLE div1_interactions ADD COLUMN IF NOT EXISTS entities text[] NOT NULL DEFAULT '{}';

-- v3: the full exchange — what DIV-1 answered, how, and from where.
--   source: console (the site's UI) | api (direct POST /api/ask) | mcp (AI agents)
ALTER TABLE div1_interactions ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'console';
ALTER TABLE div1_interactions ADD COLUMN IF NOT EXISTS answer text;
ALTER TABLE div1_interactions ADD COLUMN IF NOT EXISTS artifacts jsonb;
ALTER TABLE div1_interactions ADD COLUMN IF NOT EXISTS trace jsonb;
ALTER TABLE div1_interactions ADD COLUMN IF NOT EXISTS sources text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS div1_interactions_source_at ON div1_interactions (source, at DESC);

-- v4: privacy-first web analytics for /admin. No IPs, no full user agents:
-- a salted visitor hash, a random per-tab session id, the country from the
-- CDN's geo header, a coarse device/browser family, and engaged time (only
-- while the tab is visible). Bots and Do-Not-Track / GPC visitors are skipped.
CREATE TABLE IF NOT EXISTS div1_pageviews (
  id           text PRIMARY KEY,           -- client-generated per view
  at           timestamptz NOT NULL DEFAULT now(),
  visitor      text,
  session      text,
  path         text NOT NULL,
  referrer     text,                       -- host only
  utm_source   text,
  country      text,                       -- ISO 3166-1 alpha-2
  device       text,                       -- mobile | tablet | desktop
  browser      text,                       -- family only
  duration_ms  integer NOT NULL DEFAULT 0   -- engaged (visible) time
);
CREATE INDEX IF NOT EXISTS div1_pageviews_at ON div1_pageviews (at DESC);
CREATE INDEX IF NOT EXISTS div1_pageviews_visitor ON div1_pageviews (visitor, at);
