import {
  capabilities,
  caseStudies,
  certifications,
  changelog,
  education,
  fieldGuides,
  honors,
  type Layer,
  openSource,
  scratchIndex,
  shipped,
} from "@/data/portfolio";
import type { ArtifactKind } from "@/lib/protocol";

/**
 * Retrieval over the dossier: every fact becomes a document, and a query is
 * scored with BM25 against all of them. The router uses it to pick exact
 * entities (a repo, a case study, a role, a skill), and the constellation uses
 * the same scores for star brightness while the visitor types. It is pure,
 * deterministic, and small (~130 docs), so it runs on server and client.
 */

export interface Doc {
  /** Unique id, prefixed by type: `case:`, `repo:`, `role:`, `skill:`, … */
  id: string;
  /** The artifact that displays this fact. */
  kind: ArtifactKind;
  /** Star id in the constellation (repo path or case-study id), if any. */
  star?: string;
  label: string;
  layer?: Layer;
  /** Heavily weighted text (names, titles, stacks). */
  strong: string;
  /** Everything else. */
  body: string;
}

export interface Hit {
  doc: Doc;
  score: number;
}

/* ------------------------------------------------------------------ */
/* Text normalization                                                  */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  (
    "a an the and or of to in on for with at by from is are was were be been being has have had " +
    "do does did done he his him she her they them their what which who whom how why when where " +
    "can could would should will shall may might me my i you your it its this that these those " +
    "about any some tell show give list please there as into than then so if not no yes all also " +
    "just more most much many very such get got let like want know knows known work works worked " +
    "divanshu sharma someone anything something thing things one ever really good well us our we " +
    "experience experienced " +
    // Intent words, not content: the keyword rules handle these.
    "project projects system systems build built building result results metric metrics repo repos " +
    "repository implementation implementations implement implemented portfolio stuff"
  ).split(" "),
);

function stem(t: string): string {
  if (/^\d/.test(t) || t.length <= 3) return t;
  let s = t;
  if (s.length > 4 && s.endsWith("ies")) s = s.slice(0, -3) + "y";
  else if (s.length > 5 && s.endsWith("ing")) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith("ed")) s = s.slice(0, -2);
  else if (s.endsWith("s") && !s.endsWith("ss") && !s.endsWith("us")) s = s.slice(0, -1);
  // shipp → ship, runn → run
  if (s !== t && /([bdgmnprt])\1$/.test(s)) s = s.slice(0, -1);
  return s;
}

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/c\+\+/g, " cpp ")
    .replace(/c#/g, " csharp ")
    .replace(/\bnode\.?js\b/g, " node ")
    .replace(/\bnext\.?js\b/g, " nextjs ")
    .replace(/\bp5\.?js\b/g, " p5js ")
    .replace(/\bk8s\b/g, " kubernetes ")
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP.has(t) && (t.length > 1 || /\d/.test(t)))
    .map(stem);
}

/**
 * Query expansion: visitor vocabulary → dossier vocabulary. Expansions are
 * down-weighted so a literal match always beats a synonym.
 */
const SYNONYMS: Record<string, string> = {
  rag: "retrieval augmented vector embedding",
  llm: "language model gemini transformer",
  llms: "language model gemini transformer",
  genai: "language model gemini diffusion",
  frontend: "react nextjs tailwind web",
  "front-end": "react nextjs tailwind web",
  ui: "react nextjs tailwind web",
  backend: "fastapi express node api server",
  "back-end": "fastapi express node api server",
  fullstack: "react express mongodb fastapi",
  "full-stack": "react express mongodb fastapi",
  production: "deploy production aws live shipped serving",
  prod: "deploy production aws live shipped serving",
  deploy: "deploy production aws live shipped serving",
  deployment: "deploy production aws live shipped serving",
  secure: "vulnerabilities sanitization injection guardrail security",
  security: "vulnerabilities sanitization injection guardrail security",
  safety: "guardrail safety injection sanitization",
  chatbot: "conversational intake agent assistant",
  chatbots: "conversational intake agent assistant",
  assistant: "conversational intake agent assistant",
  agent: "agent agentic tool mcp langgraph",
  agents: "agent agentic tool mcp langgraph",
  agentic: "agent agentic tool mcp langgraph",
  speech: "asr whisper speech",
  audio: "asr whisper speech",
  voice: "asr whisper speech",
  vision: "vision image ocr cnn vit clip",
  image: "vision image ocr cnn vit clip",
  cloud: "aws gcp azure",
  devops: "docker github actions aws",
  mlops: "mlflow airflow docker actions",
  education: "university mumbai degree cgpa computer science",
  study: "university mumbai degree cgpa computer science",
  studied: "university mumbai degree cgpa computer science",
  college: "university mumbai degree cgpa computer science",
  degree: "university mumbai degree cgpa computer science",
  gpa: "university mumbai degree cgpa computer science",
  cgpa: "university mumbai degree cgpa computer science",
  graduate: "university mumbai degree cgpa computer science",
  quant: "worldquant alpha sharpe quantitative",
  trading: "worldquant alpha sharpe quantitative",
  finance: "worldquant alpha sharpe quantitative",
  testing: "test tests",
  performance: "performance latency lcp throughput batching",
  latency: "performance latency lcp throughput batching",
  privacy: "privacy mpc secure computation",
  finetune: "fine tuning lora peft sft",
  "fine-tune": "fine tuning lora peft sft",
  lead: "led turnaround founding",
  leadership: "led turnaround founding",
  team: "led turnaround founding",
  startup: "founding startup uniiq ownership",
  competitive: "leetcode codechef problems algorithmic",
  dsa: "leetcode codechef problems algorithmic",
  algorithms: "leetcode codechef problems algorithmic",
  gnn: "graph neural gcn geometric",
  nlp: "language transformer roberta deberta tokenizer",
  cv: "vision image ocr cnn vit",
  interpretability: "interpretability sparse autoencoder",
  inference: "inference serving",
  eval: "evaluation eval harness",
  "lm-eval": "evaluation harness eleutherai",
  opensource: "open source contribution merged",
  "open-source": "open source contribution merged",
  evals: "evaluation eval harness",
};

/** Multi-word visitor phrases, expanded at full weight. */
const PHRASES: Record<string, string> = {
  "graph neural": "gnn gcn geometric",
  "speech recognition": "asr whisper",
  "knowledge graph": "knowledge graph sap",
  "language model": "llm transformer",
  "prompt injection": "injection sanitization guardrail",
  "open source": "open source contribution merged",
  "evaluation harness": "evaluation harness eleutherai",
};

/** Closest on-record neighbours for common tech the dossier doesn't list. */
const RELATED: Record<string, string> = {
  kubernetes: "docker aws sagemaker",
  helm: "docker aws",
  terraform: "aws docker github actions",
  spark: "airflow polars pandas",
  hadoop: "airflow polars pandas",
  kafka: "airflow sse",
  jax: "pytorch tensorflow",
  tensorrt: "onnx inference server",
  triton: "onnx inference server",
  pinecone: "qdrant chroma vector",
  weaviate: "qdrant chroma vector",
  milvus: "qdrant chroma vector",
  faiss: "qdrant chroma hnsw",
  llamaindex: "langchain langgraph rag",
  vue: "react nextjs",
  angular: "react nextjs",
  svelte: "react nextjs",
  go: "rust cpp",
  golang: "rust cpp",
  scala: "java",
  kotlin: "java",
  swift: "react",
  tableau: "pandas",
};

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

const shippedCase: Record<string, string> = {
  Uniiq: "uniiq-platform",
  "RenAIssance OCR": "renaissance-ocr",
  "Graph Data Explorer AI": "graph-data-explorer",
};

function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  for (const c of caseStudies) {
    docs.push({
      id: `case:${c.id}`,
      kind: "projects",
      star: c.id,
      label: c.title,
      strong: `${c.title} ${c.domain} ${c.stack.join(" ")}`,
      body: `${c.problem} ${c.approach} ${c.results.map((r) => `${r.metric} ${r.detail}`).join(" ")}`,
    });
  }
  for (const e of scratchIndex) {
    const slug = e.repo.split("/")[1].replace(/[-_]/g, " ");
    docs.push({
      id: `repo:${e.repo}`,
      kind: "index",
      star: e.repo,
      label: e.name,
      layer: e.layer,
      strong: `${e.name} ${slug}`,
      body: `${e.summary} ${e.layer} ${e.lang}`,
    });
  }
  for (const s of shipped) {
    docs.push({
      id: `ship:${s.name}`,
      kind: "shipped",
      star: shippedCase[s.name],
      label: s.name,
      strong: `${s.name} ${s.tag}`,
      body: `${s.role} ${s.what}`,
    });
  }
  for (const r of changelog) {
    docs.push({
      id: `role:${r.version}`,
      kind: "experience",
      label: `${r.role} @ ${r.org}`,
      strong: `${r.role} ${r.org}`,
      body: `${r.span} ${r.summary} ${r.notes.join(" ")}`,
    });
  }
  for (const a of capabilities) {
    for (const item of a.items.split(" · ")) {
      docs.push({
        id: `skill:${item}`,
        kind: "skills",
        label: item,
        strong: item,
        body: a.area,
      });
    }
  }
  docs.push({
    id: "edu:be",
    kind: "credentials",
    label: `${education.degree}, ${education.school}`,
    strong: `${education.degree} ${education.school} education`,
    body: `${education.grade} cgpa gpa ${education.span} ${education.coursework}`,
  });
  for (const c of certifications) {
    docs.push({
      id: `cert:${c.name}`,
      kind: "credentials",
      label: c.name,
      strong: `${c.name} certificate certification`,
      body: `${c.issuer} ${c.year}`,
    });
  }
  honors.forEach((h, i) => {
    docs.push({ id: `honor:${i}`, kind: "credentials", label: h, strong: h, body: "honor award" });
  });
  for (const g of fieldGuides) {
    docs.push({
      id: `guide:${g.repo}`,
      kind: "oss",
      label: g.name,
      strong: `${g.name} course curriculum teaching`,
      body: g.summary,
    });
  }
  for (const o of openSource) {
    docs.push({
      id: `oss:${o.name}`,
      kind: "oss",
      star: o.role === "Author" ? undefined : `oss:${o.name}`,
      label: o.name,
      strong: `${o.name} open source contribution ${o.role}`,
      body: `${o.summary} ${(o.notable ?? []).map((n) => n.title).join(" ")} ${(o.reportedFixed ?? []).map((b) => b.title).join(" ")} bug report reported`,
    });
  }
  return docs;
}

/* ------------------------------------------------------------------ */
/* BM25                                                                */
/* ------------------------------------------------------------------ */

const K1 = 1.2;
// Mild length normalization: case studies are long by nature and shouldn't
// lose to their one-line duplicates in the shipped ledger.
const B = 0.5;
const STRONG_WEIGHT = 3;
const SYNONYM_WEIGHT = 0.5;

interface Indexed {
  doc: Doc;
  tf: Map<string, number>;
  len: number;
}

class Bm25 {
  readonly entries: Indexed[];
  readonly df = new Map<string, number>();
  readonly avgLen: number;
  readonly vocab: Set<string>;

  constructor(docs: Doc[]) {
    this.entries = docs.map((doc) => {
      const tf = new Map<string, number>();
      let len = 0;
      for (const t of tokens(doc.strong)) {
        tf.set(t, (tf.get(t) ?? 0) + STRONG_WEIGHT);
        len += STRONG_WEIGHT;
      }
      for (const t of tokens(doc.body)) {
        tf.set(t, (tf.get(t) ?? 0) + 1);
        len += 1;
      }
      return { doc, tf, len };
    });
    for (const e of this.entries) for (const t of e.tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    this.avgLen = this.entries.reduce((n, e) => n + e.len, 0) / Math.max(1, this.entries.length);
    this.vocab = new Set(this.df.keys());
  }

  idf(t: string): number {
    const n = this.entries.length;
    const df = this.df.get(t) ?? 0;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  }

  score(query: Map<string, number>): Hit[] {
    const hits: Hit[] = [];
    for (const e of this.entries) {
      let s = 0;
      for (const [t, w] of query) {
        const f = e.tf.get(t);
        if (!f) continue;
        s += w * this.idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * e.len) / this.avgLen)));
      }
      if (s > 0) hits.push({ doc: e.doc, score: s });
    }
    return hits.sort((a, b) => b.score - a.score);
  }
}

let index: Bm25 | null = null;
function getIndex(): Bm25 {
  index ??= new Bm25(buildDocs());
  return index;
}

/** Build a weighted query: literal terms at 1, synonym expansions at 0.5. */
function queryTerms(q: string, weight = 1): Map<string, number> {
  const terms = new Map<string, number>();
  const add = (t: string, w: number) => terms.set(t, Math.max(terms.get(t) ?? 0, w));
  const lower = q.toLowerCase();
  const raw = lower.split(/[^a-z0-9+#.-]+/).filter(Boolean);
  for (const t of tokens(q)) add(t, weight);
  for (const [phrase, exp] of Object.entries(PHRASES)) {
    if (lower.includes(phrase)) for (const t of tokens(exp)) add(t, weight);
  }
  for (const word of raw) {
    const exp = SYNONYMS[word] ?? SYNONYMS[stem(word)];
    if (exp) for (const t of tokens(exp)) add(t, weight * SYNONYM_WEIGHT);
  }
  return terms;
}

/** Scores below this are noise (a lone common word). */
export const MIN_SCORE = 2;

export function search(q: string, opts: { context?: string } = {}): Hit[] {
  const terms = queryTerms(q);
  if (opts.context) {
    for (const [t, w] of queryTerms(opts.context, 0.5)) terms.set(t, Math.max(terms.get(t) ?? 0, w));
  }
  if (!terms.size) return [];
  return getIndex().score(terms);
}

/**
 * Star relevance for the constellation, 0..1 relative to the best hit —
 * brightness while typing is the actual retrieval score.
 */
export function starRelevance(q: string): Map<string, number> {
  const out = new Map<string, number>();
  if (q.trim().length < 3) return out;
  const hits = search(q);
  const top = hits[0]?.score ?? 0;
  if (top < MIN_SCORE) return out;
  for (const h of hits) {
    const rel = h.score / top;
    if (rel < 0.3 || !h.doc.star) continue;
    out.set(h.doc.star, Math.max(out.get(h.doc.star) ?? 0, rel));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Honest absences                                                     */
/* ------------------------------------------------------------------ */

const SKILL_QUESTION =
  /\b(?:know|knows|use|uses|used|using|experience (?:with|in|using)|experienced (?:with|in)|worked (?:with|on|in)|work with|familiar(?:ity)? with|proficien\w* (?:in|with)|skilled (?:in|at|with)|good (?:at|with)|expert (?:in|at|with)|hands[- ]on (?:with|in)|background in|(?:can|does|could) he do)\s+(?:any |some |the |a |an )?(.{2,60}?)\s*[?.!]*$/i;

const FILLER = /^(?:any|some|the|a|an|his|with|in|on)\s+/i;

export interface Absence {
  /** Asked-about terms with no trace in the dossier, as the visitor typed them. */
  missing: string[];
  /** Asked-about terms that are on record. */
  present: string[];
  /** Closest on-record neighbours for the missing ones (labels). */
  closest: string[];
}

/**
 * "Does he know Kubernetes?" — if the named thing appears nowhere in the
 * dossier (literally or via a synonym), say so plainly instead of guessing.
 */
export function detectAbsence(q: string): Absence | null {
  const m = q.match(SKILL_QUESTION);
  if (!m) return null;
  const parts = m[1]
    .split(/,|\/|\band\b|\bor\b|&/i)
    .map((p) => p.trim().replace(FILLER, "").trim())
    .filter(Boolean);
  if (!parts.length) return null;
  const { vocab } = getIndex();
  const missing: string[] = [];
  const present: string[] = [];
  for (const part of parts) {
    const toks = tokens(part);
    if (!toks.length || toks.length > 3) continue; // phrases, not tech names
    const known = [...queryTerms(part).keys()].some((t) => vocab.has(t));
    (known ? present : missing).push(part);
  }
  if (!missing.length) return null;
  const closest = new Set<string>();
  for (const miss of missing) {
    const rel = RELATED[miss.toLowerCase()] ?? RELATED[stem(miss.toLowerCase())];
    if (!rel) continue;
    for (const h of search(rel).slice(0, 3)) {
      if (h.doc.kind === "skills") closest.add(h.doc.label);
    }
  }
  return { missing, present, closest: [...closest].slice(0, 3) };
}

/** Test/diagnostic access to the document set. */
export function allDocs(): Doc[] {
  return getIndex().entries.map((e) => e.doc);
}
