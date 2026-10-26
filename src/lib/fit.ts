import { site, uniiqDecisionTwin } from "@/data/portfolio";
import { type Doc, allDocs, MIN_SCORE, search, tokens } from "@/lib/retrieval";
import {
  type FitConcept,
  conceptMentions,
  conceptPattern,
} from "@/lib/fit-concepts";

/** Evidence matching, not a hiring prediction. Runs locally without a model. */
export type Strength = "strong" | "partial" | "verify" | "gap";
export interface Evidence {
  type: string;
  name: string;
  url: string;
  scope?: string;
}
export interface FitRow {
  requirement: string;
  priority: Priority;
  strength: Strength;
  /** Coverage of recognized requirement components; never a fit probability. */
  coverage: number;
  matched: string[];
  missing: string[];
  needsVerification: string[];
  explanation: string;
  evidence: Evidence[];
}

/** Where a dossier fact lives on the site (or upstream). */
export function urlFor(doc: Doc): string {
  const [type, key] = [
    doc.id.slice(0, doc.id.indexOf(":")),
    doc.id.slice(doc.id.indexOf(":") + 1),
  ];
  switch (type) {
    case "case":
      return `${site.url}/work/${key}`;
    case "repo":
    case "guide":
      return `https://github.com/${key}`;
    case "oss":
      return `${site.url}/open-source`;
    case "role":
    case "skill":
    case "edu":
    case "cert":
    case "honor":
      return `${site.url}/cv`;
    case "ship":
      return doc.star
        ? `${site.url}/work/${doc.star}`
        : `${site.url}/work#shipped`;
    default:
      return site.url;
  }
}

export type Priority = "required" | "preferred" | "unspecified";
export const STRENGTH_LABELS: Record<Strength, string> = {
  strong: "Supported",
  partial: "Partial",
  verify: "Verify",
  gap: "No evidence",
};
interface RequirementInput {
  text: string;
  priority: Priority;
}

const HEADING =
  /^(?:about (?:us|the company|the role|you)|(?:your |key )?responsibilities|(?:required |minimum |basic |preferred )?qualifications|(?:(?:required|preferred|technical) skills)|(?:technical |key |our )?requirements|what (?:you(?:(?:'|’)ll| will) (?:do|bring|need)|we(?:'|’)re looking for|we offer)|who you are|nice[- ]to[- ]have|bonus(?: points)?|benefits(?: and perks)?|perks|compensation|equal opportunity|how to apply)\s*:?$/i;
const SECTION_PREFERRED = /preferred|nice[- ]to[- ]have|bonus|set you apart/i;
const SKIP_SECTION =
  /^(?:benefits|perks|compensation|what we offer|equal opportunity|how to apply)/i;
const NON_REQUIREMENT =
  /^(?:we (?:are|build|offer|believe)|our (?:company|mission|team|benefits)|about (?:us|the company)|apply (?:now|for)|salary\b|competitive (?:salary|compensation)|(?:medical|dental|health) (?:insurance|benefits)|paid (?:time off|vacation)|equal opportunity|join (?:us|our))|\b(?:salary and benefits|compensation range)\b/i;

/** Parse sections without turning headings, benefits or a role title into evidence gaps. */
export function parseRequirements(text: string): {
  requirements: RequirementInput[];
  ignored: number;
  truncated: boolean;
} {
  const requirements: RequirementInput[] = [];
  const seen = new Set<string>();
  let priority: Priority = "unspecified",
    skip = false,
    ignored = 0;
  const raw = text
    .slice(0, 20000)
    .split(/\r?\n|[•·]|;/)
    .flatMap((l) => (l.length > 300 ? l.split(/(?<=[.!?])\s+(?=[A-Z])/) : [l]));
  let truncated = text.length > 20000;
  for (const line of raw) {
    const bullet = /^\s*(?:[-*–—]|\d+[.)])\s+/.test(line);
    const clean = line
      .replace(/^\s*(?:[-*–—]+|\d+[.)])\s*/, "")
      .replace(/^#{1,6}\s*/, "")
      .trim();
    if (!clean) continue;
    if (HEADING.test(clean)) {
      priority = SECTION_PREFERRED.test(clean)
        ? "preferred"
        : /required|minimum|basic|requirements/i.test(clean)
          ? "required"
          : "unspecified";
      skip = SKIP_SECTION.test(clean);
      ignored++;
      continue;
    }
    // An unknown heading ends a skipped section; never silently discard the next section.
    if (skip && /^[A-Za-z][^.!?]{1,80}:$/.test(clean)) {
      skip = false;
      priority = "unspecified";
      ignored++;
      continue;
    }
    if (
      skip ||
      NON_REQUIREMENT.test(clean) ||
      (!bullet &&
        /^(?:(?:senior|staff|principal|junior|lead|founding)\s+)?[\w /-]{0,45}(?:engineer|scientist|developer|architect)(?:\s*[—–|].*)?$/i.test(
          clean,
        ))
    ) {
      ignored++;
      continue;
    }
    if (clean.length < 2 || !tokens(clean).length) {
      ignored++;
      continue;
    }
    const key = clean.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) {
      ignored++;
      continue;
    }
    if (requirements.length >= 60) {
      truncated = true;
      break;
    }
    seen.add(key);
    requirements.push({
      text: clean,
      priority:
        /\b(?:preferred|desirable|optional|not required|beneficial|nice[- ]to[- ]have|bonus|a plus)\b/i.test(
          clean,
        )
          ? "preferred"
          : /\b(?:required|must[- ]have)\b/i.test(clean)
            ? "required"
            : priority,
    });
  }
  return { requirements, ignored, truncated };
}
export function splitRequirements(text: string): string[] {
  return parseRequirements(text).requirements.map((r) => r.text);
}

const RANK: Record<string, number> = {
  case: 0,
  ship: 1,
  role: 2,
  oss: 3,
  repo: 4,
  skill: 5,
  edu: 1,
  cert: 6,
  guide: 7,
  honor: 8,
};
const typeOf = (d: Doc) => d.id.split(":")[0];
const bodyOf = (d: Doc) =>
  `${d.strong} ${d.body} ${d.id === "case:uniiq-platform" ? uniiqDecisionTwin.methodology : ""}`;
const directDocs = (c: FitConcept): Doc[] =>
  allDocs()
    .filter((d) => conceptPattern(c).test(bodyOf(d)))
    .sort((a, b) => (RANK[typeOf(a)] ?? 9) - (RANK[typeOf(b)] ?? 9));

/** Only genuine equivalents; adjacent technologies never satisfy a missing named tool. */
function evidenceFor(c: FitConcept): Doc[] {
  const aliases: Record<string, string[]> = {
    Git: ["pull requests", "merged prs", "authored prs"],
    "Storage systems": ["mongodb", "postgres"],
    "Data processing": ["data pipelines", "data explorer", "preprocessing"],
    "Cloud infrastructure": ["aws", "gcp", "azure"],
    "Data modeling": ["schema", "knowledge graph", "nested-document"],
    "Defensive coding": ["idempotent", "malformed-input", "recoverable 503"],
    "Backend performance": ["backpressure", "batching", "rate policies"],
    NoSQL: ["mongodb"],
    "Vector databases": ["hnsw", "qdrant", "chroma"],
    "AI agents": ["agent runtime", "tool-calling", "react state machine"],
    "Fine-tuning": ["fine-tuned", "lora", "peft"],
    "Backend development": ["express", "fastapi", "backend"],
    "Full-stack development": ["full-stack", "full stack"],
    "LLM evaluation": ["evalforge", "admissions decision twin"],
  };
  return directDocs({
    ...c,
    aliases: [...c.aliases, ...(aliases[c.name] ?? [])],
  });
}

/** Explicit alternatives form a group; conjunctions remain separate obligations. */
function conceptGroups(text: string): FitConcept[][] {
  const mentions = conceptMentions(text);
  const groups: FitConcept[][] = [];
  let commaStart = 0;
  for (let i = 0; i < mentions.length; i++) {
    const m = mentions[i];
    const connector = i
      ? text
          .slice(mentions[i - 1].end, m.start)
          .replace(/[()]/g, "")
          .trim()
      : "";
    if (
      i &&
      /^(?:,?\s*or|\/|or (?:a |an )?(?:comparable|equivalent))$/i.test(
        connector,
      )
    ) {
      const alternatives = groups.splice(commaStart).flat();
      groups.push([...alternatives, m.concept]);
    } else {
      if (connector !== ",") commaStart = groups.length;
      groups.push([m.concept]);
    }
  }
  // An explicit "one of" list has OR semantics; don't infer this from a bare slash elsewhere.
  if (
    /\b(?:one of|either)\b/i.test(text) &&
    !/\band\b/i.test(text.slice(mentions[0]?.start ?? 0))
  )
    return [groups.flat()].filter((g) => g.length);
  return groups.filter(
    (g, i) =>
      groups.findIndex(
        (x) =>
          x.map((c) => c.name).join("|") === g.map((c) => c.name).join("|"),
      ) === i,
  );
}

function qualifications(text: string): string[] {
  const checks: string[] = [];
  if (
    /\b(?:\d+(?:\s*[-–]\s*\d+)?\+?|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:years?|months?)\b/i.test(
      text,
    )
  )
    checks.push(
      "Required duration is not established for this specific skill or responsibility.",
    );
  if (
    /\b(?:citizen(?:ship)?|security clearance|work authori[sz]ation|authori[sz]ed to work|sponsorship|visa|relocat\w*|on[- ]site|in[- ]office|residency|resident of)\b/i.test(
      text,
    )
  )
    checks.push("Confirm work eligibility, location or availability directly.");
  if (
    /\b(?:mentor\w*|manag(?:e|ed|ing) (?:a |the )?team|people management|direct reports|hiring|leadership|led (?:a |the )?team|communication|cross[- ]functional|stakeholder\w*)\b/i.test(
      text,
    )
  )
    checks.push(
      "The requested collaboration or people responsibility needs direct verification.",
    );
  if (
    /\b(?:managing and scaling|at scale|large[- ]scale|massive|millions?|billions?|petabytes?|gpu clusters?|multi[- ]node|\d+\s*(?:gpus?|users?|requests? per second))\b/i.test(
      text,
    )
  )
    checks.push(
      "The specified operating scale is not established by the portfolio.",
    );
  if (
    /\b(?:expert(?:ise)?|extensive|deep (?:expertise|experience)|advanced proficiency)\b/i.test(
      text,
    )
  )
    checks.push(
      "Confirm the requested depth in an interview; a project or listed skill alone does not establish expertise.",
    );
  if (/\benterprise(?: settings| customers| deployments)?\b/i.test(text))
    checks.push(
      "Enterprise deployment scope is not established by the portfolio.",
    );
  return checks;
}

const BOILERPLATE =
  /\b(?:senior|junior|staff|principal|experience(?:d)?(?: with| in)?|familiarity(?: with)?|knowledge of|understanding of|proficien\w*(?: in| with)?|strong|solid|proven|ability to|track record|preferred|required|must|nice to have|bonus|plus|engineers?|engineering team|role|candidate|you will|you have|robust|scalable|growing|excellent)\b/gi;
const productionDoc = (d: Doc) =>
  /^(?:ship:|role:v3\.0$|case:(?:uniiq-platform|div1-console|graph-data-explorer)$)/.test(
    d.id,
  );

export function matchRequirement(
  requirement: string,
  priority: Priority = "unspecified",
): FitRow {
  // Explicitly waived experience is not a missing qualification. Keep the statement visible.
  if (
    /^no\s+(?!(?:fewer|less|more)\b).+\s+(?:experience\s+)?(?:is\s+)?(?:required|necessary)[.!]?$/i.test(
      requirement.trim(),
    ) ||
    /\bexperience\s+(?:is\s+)?not\s+(?:required|necessary)\b/i.test(requirement)
  ) {
    return {
      requirement,
      priority: "unspecified",
      strength: "verify",
      coverage: 0,
      matched: [],
      missing: [],
      needsVerification: [
        "This wording waives a requirement; confirm its scope rather than counting it as a skill gap.",
      ],
      explanation:
        "This wording waives a requirement; confirm its scope rather than counting it as a skill gap.",
      evidence: [],
    };
  }
  const groups = conceptGroups(requirement);
  const matched: string[] = [],
    missing: string[] = [],
    docs: Doc[] = [];
  const verify = qualifications(requirement);
  const mentions = conceptMentions(requirement);
  for (let i = 1; i < mentions.length; i++) {
    const left = mentions[i - 1],
      right = mentions[i];
    if (
      requirement.slice(left.end, right.start).trim() === "/" &&
      (!evidenceFor(left.concept).length || !evidenceFor(right.concept).length)
    ) {
      verify.push(
        "A slash may mean alternatives or a combined requirement; confirm which interpretation applies.",
      );
    }
  }
  // Catch named obligations outside the catalog instead of treating a recognized neighbor as full coverage.
  for (const clause of requirement
    .split(/\b(?:and|plus|as well as)\b/i)
    .slice(1)) {
    const clean = clause
      .replace(/^(?:experience (?:with|in)|proficiency (?:with|in))\s+/i, "")
      .trim()
      .replace(/[.!]$/, "");
    if (
      !conceptMentions(clean).length &&
      /^(?:[A-Za-z][A-Za-z0-9+#.-]*)(?:\s+(?:experience|skills|knowledge))?$/.test(
        clean,
      )
    ) {
      verify.push(
        `Unassessed term: ${clean}. The matcher has no concept mapping for this wording; review it directly.`,
      );
    }
  }
  if (/\b(?:publications?|published papers?|patents?)\b/i.test(requirement))
    missing.push("Research publications or patents are not on record");
  let related =
    /\bor (?:a |an )?(?:comparable|equivalent)\b/i.test(requirement) &&
    groups.some((g) => g.length > 1);
  for (const group of groups) {
    const supported = group
      .map((c) => ({ c, docs: evidenceFor(c) }))
      .filter((x) => x.docs.length);
    if (!supported.length) {
      missing.push(group.map((c) => c.name).join(" or "));
      continue;
    }
    // One supported alternative is enough; keep evidence from the chosen branch together.
    const best = supported.sort(
      (a, b) => (RANK[typeOf(a.docs[0])] ?? 9) - (RANK[typeOf(b.docs[0])] ?? 9),
    )[0];
    matched.push(best.c.name);
    if (
      [
        "Storage systems",
        "Data processing",
        "Cloud infrastructure",
        "Data modeling",
        "Backend performance",
      ].includes(best.c.name)
    )
      related = true;
    docs.push(...best.docs.slice(0, 3));
    if (
      best.c.name === "vLLM" &&
      best.docs.every((d) => /vllm[- ]style/i.test(bodyOf(d)))
    )
      related = true;
    if (
      /\bproduction|deploy(?:ed|ing)?\b/i.test(requirement) &&
      !best.docs.some(
        (d) =>
          productionDoc(d) &&
          !(
            d.id === "case:uniiq-platform" &&
            [
              "Human evaluation",
              "Evaluation datasets",
              "LLM evaluation",
            ].includes(best.c.name)
          ),
      )
    ) {
      verify.push(
        `Production use of ${best.c.name} is not established by the linked evidence.`,
      );
    }
  }
  // Education is assessed explicitly; a bachelor's cannot silently satisfy a PhD.
  const degree =
    /\b(?:bachelor|bachelors|bachelor's|bachelor’s|master|masters|master's|master’s|ph\.?d\.?|doctorate)\b/i;
  const hasDegree =
    degree.test(requirement) || /\bB\.?[SE]\.?(?=\s|,|$)/.test(requirement);
  if (hasDegree) {
    const bachelor =
      /\bbachelor/i.test(requirement) ||
      /\bB\.?[SE]\.?(?=\s|,|$)/.test(requirement);
    const higher = /\bmaster|\bph\.?d|\bdoctorate/i.test(requirement);
    const equivalent =
      /\bor (?:equivalent|comparable)|\bequivalent (?:practical |professional |work )?experience/i.test(
        requirement,
      );
    if (bachelor && (!higher || /\bor\b/i.test(requirement))) {
      const field = requirement.match(
        /\b(?:degree|bachelor(?:[’']s)?)\s+(?:in|of)\s+(.+)/i,
      )?.[1];
      if (
        field &&
        (!/\b(?:computer science|computer engineering|CS)\b/i.test(field) ||
          /\band\b/i.test(field))
      ) {
        verify.push(
          "The documented degree is B.E. Computer Science; confirm whether it meets the requested subject or combination of subjects.",
        );
      }
      matched.push("B.E. Computer Science");
      docs.push(...allDocs().filter((d) => d.id === "edu:be"));
    } else if (higher && !equivalent)
      missing.push("Required postgraduate degree is not on record");
    else
      verify.push(
        "Confirm whether the documented B.E. and experience meet the degree or equivalence requirement.",
      );
  }
  let coverage = groups.length
    ? matched.length / Math.max(groups.length, matched.length + missing.length)
    : 0;
  if (!groups.length && !hasDegree) {
    const core = requirement.replace(BOILERPLATE, " ");
    const wanted = [...new Set(tokens(core))];
    const hits = search(core)
      .filter((h) => h.score >= MIN_SCORE)
      .slice(0, 3);
    const best = hits
      .map((h) => ({
        doc: h.doc,
        coverage:
          wanted.filter((t) => tokens(bodyOf(h.doc)).includes(t)).length /
          Math.max(1, wanted.length),
      }))
      .sort((a, b) => b.coverage - a.coverage)[0];
    if (best && best.coverage >= 0.35) {
      docs.push(best.doc);
      matched.push("Related documented work");
      coverage = best.coverage;
      related = true;
    }
  }
  if (
    /\b(?:production|deploy(?:ed|ing)?)\b/i.test(requirement) &&
    /decision twin/i.test(requirement)
  )
    verify.push(
      "The Admissions Decision Twin was designed and evaluated offline; production deployment is not established.",
    );
  const checks = [...new Set(verify)];
  const strength: Strength = missing.length
    ? matched.length
      ? "partial"
      : "gap"
    : checks.length
      ? "verify"
      : matched.length
        ? related
          ? "partial"
          : "strong"
        : "gap";
  const uniqueDocs = [...new Map(docs.map((d) => [d.id, d])).values()]
    .sort((a, b) => (RANK[typeOf(a)] ?? 9) - (RANK[typeOf(b)] ?? 9))
    .slice(0, 4);
  const explanation = [
    matched.length
      ? `Evidence found for ${matched.join(", ")}.`
      : "No direct supporting evidence found in the portfolio.",
    missing.length ? `Not on record: ${missing.join(", ")}.` : "",
    ...checks,
    related
      ? "Related work supports part of this requirement; it does not establish the full claim."
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  return {
    requirement,
    priority,
    strength,
    coverage: Math.round(coverage * 100) / 100,
    matched,
    missing,
    needsVerification: checks,
    explanation,
    evidence: uniqueDocs.map((d) => ({
      type: typeOf(d),
      name: d.label,
      url: urlFor(d),
      scope:
        d.id === "case:uniiq-platform" || d.id === "role:v3.0"
          ? "Private engineering summary"
          : typeOf(d) === "skill"
            ? "Listed skill"
            : typeOf(d) === "repo"
              ? "Repository implementation"
              : "Documented work",
    })),
  };
}

export function matchRequirements(text: string): FitRow[] {
  return parseRequirements(text).requirements.map((r) =>
    matchRequirement(r.text, r.priority),
  );
}
export function fitSummary(rows: FitRow[]) {
  const summarize = (items: FitRow[]) => ({
    total: items.length,
    strong: items.filter((r) => r.strength === "strong").length,
    partial: items.filter((r) => r.strength === "partial").length,
    verify: items.filter((r) => r.strength === "verify").length,
    gap: items.filter((r) => r.strength === "gap").length,
  });
  return {
    ...summarize(rows),
    required: summarize(rows.filter((r) => r.priority === "required")),
    preferred: summarize(rows.filter((r) => r.priority === "preferred")),
    unspecified: summarize(rows.filter((r) => r.priority === "unspecified")),
  };
}
/**
 * Interview prep pack: for each strong match, the deep-dive question he's
 * ready for, anchored on the evidence to read first. Hiring teams get a
 * structured interview; it happens on his strongest ground.
 */
/** Richest evidence first: a case study says more than a skill line. */
const EVIDENCE_RANK = ["case", "ship", "role", "oss", "repo", "skill"];

const REPO_QUESTIONS = [
  (x: string) =>
    `You rebuilt ${x} from scratch — what is its core mechanism, and how did you test it?`,
  (x: string) =>
    `In ${x}, what would break first under production load, and how would you harden it?`,
  (x: string) =>
    `What did building ${x} from scratch teach you that the library docs don't?`,
];

export function interviewQuestions(
  rows: FitRow[],
): { q: string; name: string; url: string }[] {
  const out: { q: string; name: string; url: string }[] = [];
  const seen = new Set<string>();
  let repoTurn = 0;
  for (const r of rows) {
    if (r.strength !== "strong") continue;
    const e = [...r.evidence]
      .filter((x) => !seen.has(x.name) && EVIDENCE_RANK.includes(x.type))
      .sort(
        (a, b) => EVIDENCE_RANK.indexOf(a.type) - EVIDENCE_RANK.indexOf(b.type),
      )[0];
    if (!e) continue;
    const q =
      e.type === "case"
        ? `${e.name}: what made its results hard to get, and what would you change now?`
        : e.type === "ship"
          ? `You shipped ${e.name} end-to-end — what did you cut to ship it, and what broke after?`
          : e.type === "role"
            ? `As ${e.name}, which technical decision would you defend hardest?`
            : e.type === "oss"
              ? `What did your contributions to ${e.name} teach you about that codebase?`
              : e.type === "repo"
                ? REPO_QUESTIONS[repoTurn++ % REPO_QUESTIONS.length](e.name)
                : `How have you used ${e.name}, and what evidence would demonstrate your depth?`;
    seen.add(e.name);
    out.push({ q, name: e.name, url: e.url });
  }
  return out.slice(0, 6);
}
