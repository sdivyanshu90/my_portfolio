import { counts, openSource, site } from "@/data/portfolio";
import scorecard from "@/data/eval-scorecard.json";

/**
 * Technical write-ups. Drafts (published: false) are visible only to
 * Divanshu while signed in to /admin — nothing goes live under his name
 * until he flips the flag. Every fact below is from the dossier or the
 * GitHub evidence already on the site.
 */

export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "quote"; text: string };

export interface Post {
  slug: string;
  title: string;
  dek: string;
  date: string;
  published: boolean;
  tags: string[];
  body: Block[];
}

const mastra = openSource.find((o) => o.repo === "mastra-ai/mastra");
const fixed = mastra?.reportedFixed ?? [];
const pr = (n: number) => `https://github.com/mastra-ai/mastra/pull/${n}`;

export const posts: Post[] = [
  {
    slug: "mastra-18-bugs",
    title: `${fixed.length} bugs I found and fixed at Mastra`,
    dek: "What happens when a triage bot closes your pull requests — and why the fixes landed anyway.",
    date: "2026-09-29",
    published: false,
    tags: ["open source", "TypeScript", "agents"],
    body: [
      {
        t: "p",
        text: `Between August and September 2026 I opened ${mastra?.authored ?? 29} pull requests against Mastra, the TypeScript agent framework. ${mastra?.merged ?? 11} were merged as mine — mostly fixes to its codemod and CLI migration tooling. The other ${fixed.length} are the more interesting story.`,
      },
      { t: "h2", text: "Find, file, fix" },
      {
        t: "p",
        text: `Each of those ${fixed.length} started the same way: I found a bug, filed an issue describing it, and opened a pull request with the fix and a test. They span the CLI (file replacements corrupting values containing $, environment writes that reported success after failing, polling that retried an explicit cancellation), the editor (version-zero requests returning a cached latest, processor graphs bypassing their config schemas), the codemods, and the HTTP logger's retry options.`,
      },
      { t: "h2", text: "Closed by a bot, fixed anyway" },
      {
        t: "p",
        text: "Mastra runs a triage bot that closes pull requests whose linked issue hasn't been triaged by a maintainer yet. It closed all of mine for that reason — a process rule, not a judgment on the code. Then Mastra's own automation re-fixed each issue within days, and maintainers merged those fixes.",
      },
      {
        t: "ul",
        items: [
          `Every one of the ${fixed.length} issues I filed is now fixed upstream.`,
          `One merge credits me directly as co-author (${pr(23091)}).`,
          `In at least one case the merged source change is byte-for-byte identical to mine (my ${pr(23178)} vs. the merged ${pr(23215)}).`,
        ],
      },
      { t: "h2", text: "What I'd tell someone contributing to a fast-moving framework" },
      {
        t: "ul",
        items: [
          "File the issue first and wait for triage when the project asks for it — the fix is only half the contribution.",
          "Make the bug reproducible in a test before touching the code; a red test that turns green is the whole argument.",
          "Keep each PR to one behavior. Small diffs are what get re-implemented, reviewed and merged quickly.",
          "Link everything: issue → your fix → the merged fix. The paper trail is the credit.",
        ],
      },
      {
        t: "p",
        text: `The full list — each issue, my fix, and the merged fix side by side — is on ${site.url}/open-source.`,
      },
    ],
  },
  {
    slug: "how-div1-answers",
    title: "How this portfolio answers questions without trusting an LLM",
    dek: "A deterministic router, typed answer cards, a model that only narrates — and evals in CI.",
    date: "2026-09-29",
    published: false,
    tags: ["LLM systems", "evaluation", "retrieval"],
    body: [
      {
        t: "p",
        text: "My portfolio is a console you can question. The obvious build — send the question to an LLM with my résumé in the prompt — fails the three things a portfolio must do: never invent a claim, keep working when a model is down, and not cost real money per visitor. So the model is the last step, not the first.",
      },
      { t: "h2", text: "1. Screen, then route" },
      {
        t: "p",
        text: "An injection screen runs before anything else. It only fires on text aimed at the console itself (“ignore previous instructions”, “your system prompt”) — never on topic words, because recruiters legitimately ask about credentials and I have a prompt-caching repo. A mixed question has the directive cut out and the rest answered.",
      },
      {
        t: "p",
        text: `Routing combines keyword rules (what the visitor wants: a timeline, credentials) with BM25 retrieval over every fact in a typed dossier (which repo, project, role or skill). The same relevance scores light up the stars behind the answer as you type. If you ask about something that isn't on record — Kubernetes, say — it says so, and names the closest thing that is.`,
      },
      { t: "h2", text: "2. Cards are exact; narration is optional" },
      {
        t: "p",
        text: "The answer is a set of typed cards rendered from the dossier, so every figure is exact by construction. A model only writes a short narration over exactly the facts the router selected, and every number it produces is checked against the dossier — an unknown figure is flagged on the card and the narration is never cached.",
      },
      {
        t: "ul",
        items: [
          "Presets, honest absences and repeated questions need no model at all.",
          "A narrated answer costs about $0.0002, with a daily cap and a model race across providers.",
          "Every answer records the facts it used; a cached answer is invalidated only when one of those facts changes.",
        ],
      },
      { t: "h2", text: "3. Evaluate it like a product" },
      {
        t: "p",
        text: `A golden set of ${scorecard.router.total} real questions and ${scorecard.guard.total} injection cases runs in CI on every push; the build publishes the score on the site itself (currently ${scorecard.router.passed}/${scorecard.router.total} and ${scorecard.guard.passed}/${scorecard.guard.total}). An end-to-end smoke test drives every page and API against the real database. Open-source numbers are re-verified against the GitHub API daily.`,
      },
      {
        t: "p",
        text: `It also speaks MCP, so a recruiter's AI assistant can query the same verified data directly — ${counts.systems} from-scratch systems, ${counts.mergedUpstream} merged upstream PRs, and the rest — instead of scraping a page.`,
      },
      { t: "quote", text: "The model narrates. The system decides what's true." },
    ],
  },
];

export const publishedPosts = () => posts.filter((p) => p.published);
