/**
 * Single source of truth for every word on the site.
 *
 * Provenance rules (do not violate):
 *  - Facts come from the resume PDF, the GitHub profile/API, repo READMEs,
 *    or Divanshu's supplied Uniiq engineering work summary.
 *  - Anything unverified is marked `placeholder: true` and rendered with a
 *    footnote asterisk instead of being stated as fact.
 */

/**
 * GitHub profile totals — a dated snapshot, not live. Update both numbers
 * together (and `asOf`) from https://api.github.com/users/sdivyanshu90.
 */
export const github = {
  user: "sdivyanshu90",
  publicRepos: 195,
  stars: 337, // across non-fork repos
  asOf: "2026-09",
} as const;

export const site = {
  url: "https://div90.vercel.app",
  revision: "2026.07",
  reportId: "DIV-2026.07",
  title: "Divanshu Sharma — Machine Learning & AI Engineer",
  description:
    "Divanshu Sharma is a founding engineer who ships reliable AI products — leading the technical turnaround of Uniiq's AI advising platform, previously privacy-preserving ML research at Yale and quantitative research at WorldQuant BRAIN. DIV-1 is his AI-native portfolio: query it like a model and get answers as live, source-cited artifacts.",
} as const;

export const personal = {
  name: "Divanshu Sharma",
  // Single lead identity for display (recruiters shortlist on one line);
  // `roles` stays the full IC list for metadata / JSON-LD.
  lead: "Machine Learning & AI Engineer",
  context: "Reliable AI products · Founding Engineer @ Uniiq · Mumbai",
  roles: [
    "Founding Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Software Engineer",
  ],
  currentRole: "Founding Engineer @ Uniiq",
  openTo: "Open to AI engineering & founding roles", // confirmed by Divanshu, 2026-09 — actively looking
  location: "Mumbai, India",
  // Phone is deliberately not published on the site (scraping/spam); it
  // stays on the résumé PDF for people who already have a conversation open.
  email: "divyanshu74.80@gmail.com", // per resume PDF & GitHub — the old config's "divanshu…" was a typo
  avatar: "/profile.jpg",
  abstract: [
    "Founding engineer who ships reliable AI products — currently leading the technical turnaround of Uniiq's AWS-deployed AI advising platform: 40+ critical vulnerabilities resolved, LLM sanitization and recoverable AI failures, LCP cut from 3.3s to 0.7s. Before that: privacy-preserving deep learning research at Yale and three years of quantitative research at WorldQuant BRAIN.",
    "The depth behind it is public: a habit of rebuilding the modern AI stack from first principles — transformers, diffusion, RLHF, paged KV-caches, quantization, vector indexes — each published as a readable repository.",
    "The through-line is reliable AI: structured outputs, prompt and response sanitization, failure recovery, rate limiting, consensus-fused ASR, and systems measured against explicit performance budgets.",
  ],
} as const;

/** Four headline numbers, all traceable to the resume or repo READMEs. */
export const keyResults = [
  {
    value: 40,
    display: "40+",
    label: "critical vulnerabilities resolved",
    note: "Uniiq turnaround · LCP 3.3s → 0.7s",
  },
  {
    value: 88.08,
    display: "88.08%",
    label: "ChestMNIST accuracy under MPC",
    note: "from-scratch DL library, 5 epochs",
  },
  {
    value: 48,
    display: ">48%",
    label: "absolute WER reduction",
    note: "Hindi ASR on FLEURS",
  },
  {
    value: 1.8,
    display: "1.8",
    label: "avg. Sharpe ratio",
    note: "15+ alphas · Gold, Top 1% Alphathon",
  },
] as const;

export const socials = [
  {
    label: "GitHub",
    href: "https://github.com/sdivyanshu90",
    handle: "sdivyanshu90",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/divsha22/",
    handle: "divsha22",
  },
  {
    label: "Kaggle",
    href: "https://www.kaggle.com/divanshu22",
    handle: "divanshu22",
  },
  {
    label: "LeetCode",
    href: "https://leetcode.com/u/emotional_fool/",
    handle: "emotional_fool",
  },
  {
    label: "CodeChef",
    href: "https://www.codechef.com/users/psyduck90",
    handle: "psyduck90",
  },
] as const;

export const resume = {
  href: "https://sdivyanshu90.github.io/sdivyanshu90/Divanshu_Resume.pdf",
  label: "Résumé (PDF, 135 KB)",
} as const;

/* ------------------------------------------------------------------ */
/* §01 — Selected systems (case studies)                               */
/* ------------------------------------------------------------------ */

export interface CaseStudy {
  id: string;
  fig: string;
  title: string;
  domain: string;
  year: string;
  problem: string;
  approach: string;
  results: { metric: string; detail: string }[];
  stack: string[];
  links: { label: string; href: string }[];
  /**
   * Where the result figures come from — a receipt. No `href` means the
   * source is not public, and the page says so rather than implying a link.
   */
  source: { label: string; href?: string };
}

export const caseStudies: CaseStudy[] = [
  {
    id: "uniiq-platform",
    fig: "01",
    title: "Uniiq — AI Student-Advising Platform",
    domain: "Founding engineering · Full-stack AI product",
    year: "2026",
    problem:
      "Student onboarding and admissions planning span incomplete profiles, follow-up questions, institution data, and long-running AI calls. The product needed a coherent intake experience without letting partial profiles, transient model failures, or inconsistent admin data leak into downstream workflows.",
    approach:
      "Led a technical turnaround across the AWS-deployed React, Express, MongoDB, and Gemini stack: built a three-phase conversational intake with persisted transcripts; added prompt and response sanitization, structured output validation, user-ID rate limiting, transient-503 retries, and recoverable fallbacks; enforced role-aware profile completion; normalized institution and opportunity admin workflows; and code-split 21 routes with explicit Lighthouse budgets.",
    results: [
      {
        metric: "40+ critical vulnerabilities",
        detail:
          "resolved in inherited legacy code, including prompt-injection and data-leak risks",
      },
      {
        metric: "73 → 93 performance score",
        detail: "LCP cut from 3.3s to 0.7s; INP reduced to 130ms",
      },
      {
        metric: "1,199 lines of tests",
        detail: "automated coverage added across 12 test modules",
      },
      {
        metric: "21 routes code-split",
        detail:
          "PR target: main entry 1.45 MB → 278 KB (81 KB gzipped); not a production measurement",
      },
    ],
    stack: ["React", "TypeScript", "Express", "MongoDB", "Gemini"],
    source: { label: "Uniiq engineering work summary (2026-07) — private codebase, not publicly verifiable" },
    links: [{ label: "Uniiq", href: "https://uniiq.ai" }],
  },
  {
    id: "mpc-deep-learning",
    fig: "02",
    title: "Privacy-Preserving Deep Learning via MPC",
    domain: "ML research · Yale University",
    year: "2025–26",
    problem:
      "Institutions holding sensitive data — hospitals, biobanks — cannot pool it to train shared models. Standard frameworks assume the training data is visible to the machine doing the training.",
    approach:
      "Engineered a secure, open-source deep learning library from first principles in Python/NumPy — no external autograd — around a compiler-centric multi-party computation architecture, so collaborative training carries verifiable cryptographic guarantees rather than policy promises. Proposed the CNN stack upstream to Sequre (0xTCG/sequre) through a series of pull requests.",
    results: [
      {
        metric: "88.08% test accuracy",
        detail: "ChestMNIST, strided-convolution CNN, 5 epochs @ batch 512",
      },
      {
        metric: "0 external autograd deps",
        detail:
          "backprop, conv & pooling layers derived and implemented by hand",
      },
      {
        metric: "4 upstream PRs",
        detail: "CNN layers & MPC training pipeline proposed to 0xTCG/sequre",
      },
    ],
    stack: ["Python", "NumPy", "MPC", "Compiler design", "Cryptography"],
    source: { label: "résumé.pdf; the code is public in the Sequre PRs", href: "https://github.com/0xTCG/sequre/pull/41" },
    links: [
      {
        label: "Sequre PRs",
        href: "https://github.com/0xTCG/sequre/pulls?q=is%3Apr+author%3Asdivyanshu90",
      },
      { label: "0xTCG/sequre", href: "https://github.com/0xTCG/sequre" },
    ],
  },
  {
    id: "indic-asr",
    fig: "03",
    title: "Indic ASR Optimization & Consensus Evaluation",
    domain: "Speech · Evaluation research",
    year: "2025",
    problem:
      "Off-the-shelf Whisper underperforms on Hindi: Devanagari orthography is inconsistent across corpora, and single-model transcripts fail unpredictably — so the evaluation itself is unreliable before the model is.",
    approach:
      "Fine-tuned Whisper-small with SpecAugment, label smoothing and cosine LR scheduling under a 5-beam search pipeline; built a Devanagari normalization engine with phonetic reverse-transliteration; then fused five ASR systems through word-level confusion networks with majority voting, so the final transcript is a measured consensus rather than one model's guess.",
    results: [
      {
        metric: ">48% absolute WER reduction",
        detail: "FLEURS Hindi benchmark vs. baseline Whisper-small",
      },
      {
        metric: "177,000 unique terms",
        detail: "normalized via Devanagari engine + reverse transliteration",
      },
      {
        metric: "5-model consensus",
        detail: "word-level confusion networks, majority voting",
      },
    ],
    stack: ["Whisper", "Transformers", "SpecAugment", "Beam search", "Librosa"],
    source: { label: "write-up on his GitHub profile README", href: "https://github.com/sdivyanshu90/sdivyanshu90" },
    links: [
      {
        label: "Write-up",
        href: "https://github.com/sdivyanshu90/sdivyanshu90",
      },
    ],
  },
  {
    id: "renaissance-ocr",
    fig: "04",
    title: "RenAIssance OCR — Historical Document Pipeline",
    domain: "Computer vision · NLP",
    year: "2026",
    problem:
      "16th–17th-century Spanish print defeats modern OCR: degraded paper, archaic ligatures, long-s glyphs, and almost no labeled training data.",
    approach:
      "Chained CRAFT text detection, an SE-ResNet-BiLSTM CRNN recognizer with beam-search decoding, and a RoBERTa-based post-processor; scaled 183 labeled pages to 12,792 training samples through a 7-step augmentation-heavy preprocessing workflow tuned to period-specific degradation.",
    results: [
      {
        metric: "Word accuracy 97.96% → 98.17%",
        detail: "full corpus, after LLM post-processing",
      },
      {
        metric: "CER 3.44% → 0.00%",
        detail: "on the held-out 183-page validation set",
      },
      {
        metric: "12,792 training samples",
        detail: "synthesized from 183 scarce period pages",
      },
    ],
    stack: ["PyTorch", "CRAFT", "CRNN", "RoBERTa", "OpenCV"],
    source: { label: "repo README", href: "https://github.com/sdivyanshu90/RenAIssance-OCR#readme" },
    links: [
      {
        label: "GitHub",
        href: "https://github.com/sdivyanshu90/RenAIssance-OCR",
      },
    ],
  },
  {
    id: "kv-cache-engine",
    fig: "05",
    title: "Paged KV-Cache Engine (vLLM-style)",
    domain: "LLM inference systems",
    year: "2026",
    problem:
      "Naïve KV-cache allocation wastes most of a GPU: memory fragments, identical prompt prefixes are recomputed, and batch scheduling stalls on the longest sequence.",
    approach:
      "Implemented vLLM's core ideas from scratch: GPU memory treated as virtual memory with fixed-size physical blocks and per-sequence page tables, ref-counted copy-on-write forking, a radix-tree prefix cache for shared prompts, and a continuous-batching scheduler moving sequences through WAITING/RUNNING/SWAPPED states.",
    results: [
      {
        metric: "Copy-on-write forking",
        detail: "ref-counted blocks shared across forked sequences",
      },
      {
        metric: "Radix-tree prefix cache",
        detail: "shared prompt prefixes served without recompute",
      },
      {
        metric: "Continuous batching",
        detail: "scheduler with swap-in/swap-out under memory pressure",
      },
    ],
    stack: ["Python", "PyTorch", "Scheduling", "Memory management"],
    source: { label: "repo README", href: "https://github.com/sdivyanshu90/build-your-own-kv-cache#readme" },
    links: [
      {
        label: "GitHub",
        href: "https://github.com/sdivyanshu90/build-your-own-kv-cache",
      },
    ],
  },
  {
    id: "graph-data-explorer",
    fig: "06",
    title: "Graph Data Explorer AI",
    domain: "Applied LLM product",
    year: "2026",
    problem:
      "21,393 SAP order-to-cash records across 19 flat tables — relationships a business user can neither see nor query without SQL and schema knowledge.",
    approach:
      "Transformed the tables into a typed knowledge graph (765 nodes, 877 edges) served by FastAPI with SSE streaming and a React Flow visual layer; built a two-stage LLM pipeline (natural language → sandboxed graph traversal → natural-language explanation) wrapped in layered guardrails: keyword pre-filters, sandboxed execution, forbidden-token checks.",
    results: [
      {
        metric: "765 nodes / 877 edges",
        detail: "typed knowledge graph from 19 source tables",
      },
      {
        metric: "Two-stage LLM query engine",
        detail: "NL → traversal → NL, fully sandboxed",
      },
      {
        metric: "3 guardrail layers",
        detail: "pre-filters, sandbox, forbidden-token checks",
      },
    ],
    stack: ["FastAPI", "React Flow", "NetworkX", "SSE", "Gemini 2.5 Flash"],
    source: { label: "repo README", href: "https://github.com/sdivyanshu90/Graph-Data-Explorer-AI#readme" },
    links: [
      {
        label: "GitHub",
        href: "https://github.com/sdivyanshu90/Graph-Data-Explorer-AI",
      },
    ],
  },
  {
    id: "ml4sci-cms",
    fig: "07",
    title: "Deep Learning for CMS Detector Physics",
    domain: "Scientific ML · ML4SCI / CERN CMS",
    year: "2024",
    problem:
      "Event reconstruction at the CMS detector needs classifiers that separate electrons from photons and quark from gluon jets on raw detector images — where physics-blind architectures plateau.",
    approach:
      "Developed a custom ResNet-15 CNN on raw CMS detector data; implemented a graph convolutional network for particle momentum regression that matched a heavier GAT baseline's ROC curve; applied targeted VGG-style CNNs to jet classification.",
    results: [
      {
        metric: "80% AUC",
        detail: "electron-vs-photon classification, custom ResNet-15",
      },
      {
        metric: "−30% training time",
        detail: "GCN matching the GAT baseline for momentum regression",
      },
      {
        metric: "+7% jet classification",
        detail: "quark/gluon separation via targeted VGG-style CNNs",
      },
    ],
    stack: ["PyTorch", "PyTorch Geometric", "TensorFlow", "CNN", "GCN"],
    source: { label: "repo README", href: "https://github.com/sdivyanshu90/ProblemPioneer#readme" },
    links: [
      {
        label: "GitHub",
        href: "https://github.com/sdivyanshu90/ProblemPioneer",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* §02 — The from-scratch index                                        */
/* ------------------------------------------------------------------ */

export type Layer =
  | "Modeling & training"
  | "Alignment & fine-tuning"
  | "Inference & serving"
  | "Retrieval & data"
  | "Evaluation & safety";

export const layers: Layer[] = [
  "Modeling & training",
  "Alignment & fine-tuning",
  "Inference & serving",
  "Retrieval & data",
  "Evaluation & safety",
];

export interface ScratchEntry {
  name: string;
  repo: string; // path after github.com/
  layer: Layer;
  summary: string;
  lang: string;
  /**
   * True only where the README shows real engineering rigor (tests, strict
   * typing, production concerns). Everything else is an honest reference
   * implementation — the point is understanding, not shipping a library.
   */
  engineered?: boolean;
}

/** One-liners are grounded in each repo's README / the series index README. */
export const scratchIndex: ScratchEntry[] = [
  // — Modeling & training —
  {
    name: "Transformer",
    repo: "sdivyanshu90/Transformer-from-Scratch",
    layer: "Modeling & training",
    lang: "Python",
    summary: "“Attention Is All You Need” implemented end-to-end.",
  },
  {
    name: "Vision Transformer",
    repo: "sdivyanshu90/build-your-own-vit",
    layer: "Modeling & training",
    lang: "Python",
    summary:
      "Production-grade ViT: training engine, FastAPI serving, ONNX export, >95% test coverage.",
    engineered: true,
  },
  {
    name: "CLIP multimodal projector",
    repo: "sdivyanshu90/build-your-own-clip-projector",
    layer: "Modeling & training",
    lang: "Python",
    summary:
      "From-scratch dual encoders + symmetric contrastive loss, packaged as a hardened FastAPI embedding service with OpenAPI and operational guides.",
    engineered: true,
  },
  {
    name: "WhisperLite",
    repo: "sdivyanshu90/build-your-own-whisper",
    layer: "Modeling & training",
    lang: "Python",
    summary:
      "Whisper-style ASR from scratch: log-mel frontend, byte BPE, encoder–decoder Transformer, KV-cached decoding, training and hardened serving — 216 tests.",
    engineered: true,
  },
  {
    name: "Diffusion models",
    repo: "sdivyanshu90/build-your-own-diffusion",
    layer: "Modeling & training",
    lang: "Python",
    summary:
      "DDPM + DDIM with a timestep-conditioned UNet — every equation implemented, no `diffusers`.",
  },
  {
    name: "Small language model",
    repo: "sdivyanshu90/build-your-own-slm",
    layer: "Modeling & training",
    lang: "Python",
    summary: "A small LM trained from scratch, end to end.",
  },
  {
    name: "State space model",
    repo: "sdivyanshu90/build-your-own-ssm",
    layer: "Modeling & training",
    lang: "Python",
    summary: "Mamba-style selective state space model.",
  },
  {
    name: "MoE router",
    repo: "sdivyanshu90/build-your-own-moe-router",
    layer: "Modeling & training",
    lang: "Python",
    summary: "Mixture-of-Experts routing layer with load-balancing losses.",
  },
  {
    name: "Knowledge distillation",
    repo: "sdivyanshu90/build-your-own-distillation",
    layer: "Modeling & training",
    lang: "Python",
    summary: "Teacher→student distillation pipeline.",
  },
  {
    name: "BPE tokenizer",
    repo: "sdivyanshu90/bpe-from-scratch",
    layer: "Modeling & training",
    lang: "Python",
    summary: "Byte-pair encoding tokenizer from first principles.",
  },
  {
    name: "FlashAttention",
    repo: "sdivyanshu90/FlashAttention-From-Scratch",
    layer: "Modeling & training",
    lang: "Python",
    summary: "Tiled, IO-aware attention kernel reimplementation.",
  },
  {
    name: "Distributed training",
    repo: "sdivyanshu90/build-your-own-distributed-training",
    layer: "Modeling & training",
    lang: "Python",
    summary: "FSDP / tensor-parallel training loop mechanics.",
  },
  // — Alignment & fine-tuning —
  {
    name: "RLHF pipeline",
    repo: "sdivyanshu90/build-your-own-rlhf",
    layer: "Alignment & fine-tuning",
    lang: "Python",
    summary: "Reward modeling + PPO policy optimization loop.",
  },
  {
    name: "DPO",
    repo: "sdivyanshu90/build-your-own-dpo",
    layer: "Alignment & fine-tuning",
    lang: "Python",
    summary: "Direct Preference Optimization loss and trainer.",
  },
  {
    name: "LoRA trainer",
    repo: "sdivyanshu90/build-your-own-lora",
    layer: "Alignment & fine-tuning",
    lang: "Python",
    summary: "Low-rank adaptation training from scratch.",
  },
  {
    name: "PEFT library",
    repo: "sdivyanshu90/peft-from-scratch",
    layer: "Alignment & fine-tuning",
    lang: "Python",
    summary:
      "LoRA, DoRA, VeRA, IA³, adapters, prefix & prompt tuning — mypy-strict, ~96% coverage.",
    engineered: true,
  },
  // — Inference & serving —
  {
    name: "Inference server",
    repo: "sdivyanshu90/build-your-own-inference-server",
    layer: "Inference & serving",
    lang: "Rust",
    summary:
      "ONNX Runtime + Axum: backpressure, graceful shutdown, Prometheus metrics.",
    engineered: true,
  },
  {
    name: "Paged KV cache",
    repo: "sdivyanshu90/build-your-own-kv-cache",
    layer: "Inference & serving",
    lang: "Python",
    summary:
      "vLLM-style page tables, copy-on-write forking, radix prefix cache, continuous batching.",
    engineered: true,
  },
  {
    name: "Speculative decoding",
    repo: "sdivyanshu90/speculative-decoding-from-scratch",
    layer: "Inference & serving",
    lang: "Python",
    summary: "Draft-and-verify decoding with acceptance sampling.",
  },
  {
    name: "Logit processor",
    repo: "sdivyanshu90/build-your-own-logit-processor",
    layer: "Inference & serving",
    lang: "Python",
    summary: "Composable sampling: temperature, top-k/p, repetition penalties.",
  },
  {
    name: "Prompt cache",
    repo: "sdivyanshu90/build-your-own-prompt-cache",
    layer: "Inference & serving",
    lang: "Python",
    summary: "Prefix-aware prompt caching for LLM serving.",
  },
  {
    name: "Quantization library",
    repo: "sdivyanshu90/FromScratchQuant",
    layer: "Inference & serving",
    lang: "Python",
    summary:
      "INT8 / FP4 (E2M1) / NF4 with MinMax, percentile, KL & MSE calibration — zero `bitsandbytes`.",
    engineered: true,
  },
  {
    name: "AI gateway",
    repo: "sdivyanshu90/build-your-own-ai-gateway",
    layer: "Inference & serving",
    lang: "TypeScript",
    summary: "Multi-provider LLM gateway: routing, retries, keys.",
  },
  {
    name: "funcflow",
    repo: "sdivyanshu90/funcflow",
    layer: "Inference & serving",
    lang: "TypeScript",
    summary:
      "Model-agnostic function router with validated tool registries, dependency-aware plans, parallel execution, retries and provider fallbacks.",
    engineered: true,
  },
  // — Retrieval & data —
  {
    name: "Vector database",
    repo: "sdivyanshu90/Vector-Database-from-Scratch",
    layer: "Retrieval & data",
    lang: "Python",
    summary:
      "HNSW index from scratch — recall >0.95 on a 10K-vector benchmark.",
  },
  {
    name: "RAG pipeline",
    repo: "sdivyanshu90/RAG-Pipeline-From-Scratch",
    layer: "Retrieval & data",
    lang: "Python",
    summary:
      "Chunking, embedding, retrieval and generation without frameworks.",
  },
  {
    name: "Graph RAG",
    repo: "sdivyanshu90/graph-rag-from-scratch",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "Knowledge-graph-backed retrieval augmented generation.",
  },
  {
    name: "Semantic router",
    repo: "sdivyanshu90/semantic-router-from-scratch",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "Embedding-based intent routing for LLM apps.",
  },
  {
    name: "Data curation pipeline",
    repo: "sdivyanshu90/build-your-own-data-curation-pipeline",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "Dedup, filtering and quality scoring for training corpora.",
  },
  {
    name: "Synthetic data",
    repo: "sdivyanshu90/build-your-own-synth-data",
    layer: "Retrieval & data",
    lang: "JavaScript",
    summary: "Synthetic dataset generation toolkit.",
  },
  {
    name: "Feature store",
    repo: "sdivyanshu90/build-your-own-feature-store",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "Offline/online feature storage with point-in-time correctness.",
  },
  {
    name: "Code interpreter",
    repo: "sdivyanshu90/build-your-own-code-interpreter",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "Sandboxed code-execution tool for agents.",
  },
  // — Evaluation & safety —
  {
    name: "LLM eval harness",
    repo: "sdivyanshu90/EvalForge",
    layer: "Evaluation & safety",
    lang: "Python",
    summary:
      "JSONL datasets → prompt templates → provider adapters → scorers → crash-safe artifacts.",
    engineered: true,
  },
  {
    name: "Guardrails",
    repo: "sdivyanshu90/guardrails-from-scratch",
    layer: "Evaluation & safety",
    lang: "TypeScript",
    summary: "Input/output validation and policy enforcement for LLM apps.",
  },
  {
    name: "SAE interpretability toolkit",
    repo: "sdivyanshu90/build-your-own-sae",
    layer: "Evaluation & safety",
    lang: "Python",
    summary:
      "Activation hooks → sharded SafeTensors → ReLU/Top-K sparse autoencoders → evaluation, feature inspection and causal interventions.",
    engineered: true,
  },
  {
    name: "ThinkAct agent runtime",
    repo: "sdivyanshu90/ThinkAct",
    layer: "Evaluation & safety",
    lang: "Python",
    summary:
      "Explicit ReAct state machine with strict JSON actions, bounded memory, tool timeouts, repeat detection and prompt-injection redaction.",
    engineered: true,
  },
  {
    name: "Reasoning orchestrator",
    repo: "sdivyanshu90/llm-orchestrator",
    layer: "Evaluation & safety",
    lang: "Python",
    summary:
      "Decompose → reason → critique → synthesize pipeline with targeted revision cycles, confidence signaling and runtime budgets.",
    engineered: true,
  },
  // — Added 2026-09: verified against each README, source tree and CI run.
  //   ⚙ only where CI is green or mostly green; build-your-own-nas is left out
  //   until its own test suite passes. —
  {
    name: "AI observability platform",
    repo: "sdivyanshu90/build-your-own-ai-observability",
    layer: "Evaluation & safety",
    lang: "Python",
    summary: "OTLP tracing, retrieval/agent-trajectory visualization and cost accounting for LLM apps.",
    engineered: true,
  },
  {
    name: "Durable coding and research agent",
    repo: "sdivyanshu90/build-your-own-durable-agent",
    layer: "Evaluation & safety",
    lang: "Python",
    summary: "Local-first agent: SQL-backed task graph, checkpoint/resume, evidence-cited reports.",
  },
  {
    name: "Text embedding model",
    repo: "sdivyanshu90/build-your-own-embeddings",
    layer: "Modeling & training",
    lang: "Python",
    summary: "Transformer text embedding model: contrastive training, export, FAISS index and serving.",
  },
  {
    name: "Hybrid distributed training",
    repo: "sdivyanshu90/build-your-own-hybrid-distributed-training",
    layer: "Modeling & training",
    lang: "Python",
    summary: "DDP/FSDP/tensor/sequence parallelism from raw collectives, checked against PyTorch DDP.",
    engineered: true,
  },
  {
    name: "Knowledge graph builder",
    repo: "sdivyanshu90/build-your-own-knowledge-graph",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "Documents to an evidence-linked graph: ontology validation, entity resolution, retraction.",
  },
  {
    name: "LLM evaluation platform",
    repo: "sdivyanshu90/build-your-own-llm-evals",
    layer: "Evaluation & safety",
    lang: "Python",
    summary: "Typed monorepo for offline LLM/RAG/agent evals: metrics, paired statistics, gates.",
    engineered: true,
  },
  {
    name: "Model merger",
    repo: "sdivyanshu90/build-your-own-model-merger",
    layer: "Alignment & fine-tuning",
    lang: "Python",
    summary: "Model soups and SLERP checkpoint merging with bounded, streaming, per-tensor memory use.",
    engineered: true,
  },
  {
    name: "Two-tower recommender",
    repo: "sdivyanshu90/build-your-own-recommender",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "Two-tower candidate retrieval: in-batch softmax, FAISS HNSW, policy-aware reranking.",
    engineered: true,
  },
  {
    name: "Text-to-SQL engine",
    repo: "sdivyanshu90/build-your-own-text2sql",
    layer: "Retrieval & data",
    lang: "Python",
    summary: "NL to SQL with AST validation, tenant rewriting, cost analysis after generation.",
    engineered: true,
  },
  {
    name: "Text-to-speech pipeline",
    repo: "sdivyanshu90/build-your-own-tts",
    layer: "Modeling & training",
    lang: "Python",
    summary: "FastSpeech2 + HiFi-GAN vocoder: data pipeline through serving; ships no trained voices.",
    engineered: true,
  },
];

export interface FieldGuide {
  name: string;
  repo: string;
  summary: string;
}

/** Teaching repositories — curricula written while learning in public. */
export const fieldGuides: FieldGuide[] = [
  {
    name: "5-Day AI Agents Intensive (Google)",
    repo: "sdivyanshu90/5-Day-AI-Agents-Intensive-Course-with-Google",
    summary: "Worked course notebooks — his most-starred repo.",
  },
  {
    name: "MCP Zero to Hero",
    repo: "sdivyanshu90/MCP-Zero-To-Hero",
    summary:
      "7 theory chapters + 20 graded Model Context Protocol projects in TS & Python.",
  },
  {
    name: "Agentic AI — Zero to Hero",
    repo: "sdivyanshu90/Agentic-AI-Zero-to-Hero",
    summary:
      "25 modules on agent primitives, memory, orchestration, evals and prompt-injection defense.",
  },
  {
    name: "LangChain DeepAgents Playbook",
    repo: "sdivyanshu90/LangChain-DeepAgents-Playbook",
    summary:
      "20 projects from LCEL foundations to multi-actor LangGraph systems.",
  },
  {
    name: "The RAG Engineering Handbook",
    repo: "sdivyanshu90/The-RAG-Engineering-Handbook",
    summary:
      "Basic RAG → production graph-enhanced, self-correcting retrieval.",
  },
  {
    name: "HLD Zero to Hero",
    repo: "sdivyanshu90/HLD-Zero-to-Hero",
    summary:
      "12 system-design modules + 20 full walkthroughs with Python implementations.",
  },
  {
    name: "LLD Zero to Hero",
    repo: "sdivyanshu90/LLD-Zero-to-Hero",
    summary:
      "Six progressive design modules plus 30 Python problem designs spanning OOP, patterns, concurrency and thread safety.",
  },
  {
    name: "Graph Zero to Hero",
    repo: "sdivyanshu90/Graph-Zero-to-Hero",
    summary:
      "Six-phase graph algorithms reference from traversal fundamentals through shortest paths, MSTs, network flow and matching.",
  },
  {
    name: "AI — From Scratch to Scale",
    repo: "sdivyanshu90/AI-from-scratch-to-scale",
    summary:
      "Seven-phase roadmap from math primitives to vLLM, quantization and AI security.",
  },
  {
    name: "CS From Zero",
    repo: "sdivyanshu90/CS-From-Zero",
    summary: "Interactive platform covering 9 CS-fundamentals modules.",
  },
];

/**
 * The 0→1 ledger — things Divanshu built end-to-end and shipped, for the
 * founder lens: what he owned, not what he studied. Ordered by ownership.
 */
export const shipped = [
  {
    name: "Uniiq",
    role: "Founding Engineer — full-stack AI product",
    what: "Led the turnaround of an AWS-deployed AI onboarding platform: resolved 40+ critical vulnerabilities, added LLM sanitization and resilient conversational intake, expanded student and admin workflows, and raised web performance from 73 to 93.",
    href: "https://uniiq.ai",
    tag: "live product",
  },
  {
    name: "DIV-1 (this portfolio)",
    role: "Designed, built & shipped solo",
    what: "An AI-native generative-UI console with a deterministic fallback and a server-side prompt-injection firewall — the interface you're using now.",
    href: "https://github.com/sdivyanshu90/my_portfolio",
    tag: "0→1",
  },
  {
    name: "Graph Data Explorer AI",
    role: "Built end-to-end",
    what: "Turned 21,393 SAP records into a guarded natural-language knowledge-graph query engine — FastAPI + SSE + React Flow, a two-stage LLM pipeline, three guardrail layers.",
    href: "https://github.com/sdivyanshu90/Graph-Data-Explorer-AI",
    tag: "full-stack AI",
  },
  {
    name: "University Admission MCP",
    role: "Built end-to-end",
    what: "Agentic admissions advisor: Playwright scraping → SQLite → MCP server → tool-calling client, with 39 automated tests and strict typechecking.",
    href: "https://github.com/sdivyanshu90/mcp-college-counselor",
    tag: "agents",
  },
  {
    name: "RenAIssance OCR",
    role: "Research + full pipeline",
    what: "Three-stage historical-OCR system (CRAFT → SE-ResNet-BiLSTM CRNN → RoBERTa) reaching 98.17% full-corpus word accuracy on 16th-c. Spanish print.",
    href: "https://github.com/sdivyanshu90/RenAIssance-OCR",
    tag: "applied ML",
  },
  {
    name: "GSoC Explorer",
    role: "Built end-to-end",
    what: "Next.js app over five years of Google Summer of Code data, backed by a SQLite-cached archive API with analytics.",
    href: "https://github.com/sdivyanshu90/GSoC-Explorer",
    tag: "product",
  },
] as const;

/**
 * Upstream open source, verified against the GitHub API (2026-09-28).
 * Every issue and PR here is his work. "merged" means merged as his PR;
 * bugs he found and patched that were fixed upstream after a bot closed his
 * PR are listed separately with both links. No maintainer title is claimed.
 */
export interface Contribution {
  name: string;
  href: string;
  /** Merged PRs; 0 with `proposal` for unmerged work. */
  merged: number;
  /** Every PR he opened there (merged, closed, and in review). */
  authored?: number;
  /** PRs currently open, awaiting review. */
  open?: number;
  role: "Contributor" | "Proposal" | "In review" | "Author";
  summary: string;
  notable?: { title: string; href: string }[];
  /**
   * Bugs he reported *and* sent a fix for, where his PR was closed by a bot
   * and the maintainers merged a fix for his issue. Not counted as merges:
   * the landed fix is linked so anyone can compare.
   */
  reportedFixed?: { issue: number; pr: number; landed: number; title: string; credited?: boolean }[];
  /** Repo slug for building issue/PR links. */
  repo?: string;
}

export const openSource: Contribution[] = [
  {
    name: "Mastra (mastra-ai/mastra)",
    href: "https://github.com/mastra-ai/mastra/pulls?q=is%3Apr+author%3Asdivyanshu90+is%3Amerged",
    merged: 11,
    role: "Contributor",
    repo: "mastra-ai/mastra",
    authored: 29,
    summary:
      "29 PRs and 18 bug reports to the TypeScript agent framework (Aug–Sep 2026). 11 merged directly — codemod and CLI fixes for its migration tooling — and all 18 bugs he found and patched are fixed upstream, one merged with him as co-author. #58 of 466 contributors by commits.",
    notable: [
      { title: "fix(codemod): migrate RuntimeContext DI imports", href: "https://github.com/mastra-ai/mastra/pull/24472" },
      { title: "fix(codemod): forward jscodeshift output", href: "https://github.com/mastra-ai/mastra/pull/24530" },
      { title: "fix(codemod): migrate message types to valid exports", href: "https://github.com/mastra-ai/mastra/pull/25104" },
      { title: "fix(cli): retry direct network errors", href: "https://github.com/mastra-ai/mastra/pull/22622" },
    ],
    // Verified 2026-09-28: every issue authored by him; every landed PR fixes
    // that same issue (#23178's source change is byte-identical to #23215's).
    reportedFixed: [
      { issue: 22619, pr: 22620, landed: 23091, title: "CLI file replacements corrupt values containing $", credited: true },
      { issue: 23174, pr: 23175, landed: 23212, title: "CLI entry discovery accepts directories as files" },
      { issue: 23176, pr: 23178, landed: 23215, title: "CLI environment writes resolve successfully after failure" },
      { issue: 23191, pr: 23192, landed: 23211, title: "CLI package inventory ignores optional Mastra dependencies" },
      { issue: 23193, pr: 23194, landed: 23208, title: "Peer-dependency fix suggests npm inside pnpm workspaces" },
      { issue: 23302, pr: 23303, landed: 23607, title: "Peer-dependency warning crashes on unresolved versions" },
      { issue: 23305, pr: 23306, landed: 23352, title: "CLI polling retries explicit cancellation" },
      { issue: 23396, pr: 23398, landed: 23562, title: "Editor version-zero request can return cached latest" },
      { issue: 23400, pr: 23401, landed: 23569, title: "Editor processor graphs bypass provider config schemas" },
      { issue: 23712, pr: 23713, landed: 24095, title: "Conditional processor defaults run alongside matching rules" },
      { issue: 23715, pr: 23717, landed: 24099, title: "Stored processor graph step IDs discarded in workflows" },
      { issue: 23820, pr: 23821, landed: 23838, title: "Per-tool workspace settings do not round-trip" },
      { issue: 23822, pr: 23823, landed: 23837, title: "Scorer cache eviction can remove code-defined scorers" },
      { issue: 23963, pr: 23964, landed: 24009, title: "Inline workspace identity depends on property order" },
      { issue: 23966, pr: 23967, landed: 24000, title: "Editor clearCache leaves version-specific agents" },
      { issue: 24248, pr: 24249, landed: 24292, title: "Composio catalog failures returned as success" },
      { issue: 24778, pr: 24781, landed: 24783, title: "Codemod transform failures not reported" },
      { issue: 25245, pr: 25250, landed: 25265, title: "HttpTransport ignores zero and false retry options" },
    ],
  },
  {
    name: "EleutherAI lm-evaluation-harness",
    href: "https://github.com/EleutherAI/lm-evaluation-harness/pulls?q=is%3Apr+author%3Asdivyanshu90+is%3Amerged",
    merged: 4,
    authored: 25,
    open: 21,
    role: "Contributor",
    summary:
      "25 PRs to the standard LLM evaluation harness (Aug–Sep 2026): 4 merged — CLI argument parsing, request-cache robustness, and a restored benchmark task — and 21 in review.",
    notable: [
      { title: "Preserve signed integer types in CLI arguments", href: "https://github.com/EleutherAI/lm-evaluation-harness/pull/4136" },
      { title: "Allow braces in CLI key-value arguments", href: "https://github.com/EleutherAI/lm-evaluation-harness/pull/4144" },
      { title: "Restore the FLAN RTE prompt-2 task", href: "https://github.com/EleutherAI/lm-evaluation-harness/pull/4156" },
      { title: "Create missing request-cache parent directories", href: "https://github.com/EleutherAI/lm-evaluation-harness/pull/4047" },
    ],
  },
  {
    name: "Experiential (experientiallabs)",
    href: "https://github.com/experientiallabs/experiential/pulls?q=is%3Apr+author%3Asdivyanshu90+is%3Amerged",
    merged: 2,
    authored: 20,
    open: 18,
    role: "Contributor",
    summary:
      "20 PRs (Sep 2026): 2 merged model-provider fixes — paginated Anthropic model discovery and Gemini page-token handling — and 18 in review.",
    notable: [
      { title: "providers: paginate Anthropic model discovery", href: "https://github.com/experientiallabs/experiential/pull/1056" },
    ],
  },
  {
    name: "Sequre (0xTCG)",
    href: "https://github.com/0xTCG/sequre/pulls?q=is%3Apr+author%3Asdivyanshu90",
    merged: 0,
    authored: 4,
    open: 1,
    role: "Proposal",
    summary:
      "4 PRs bringing the Yale work upstream — CNN layers and an MPC ChestMNIST training pipeline (#41 alone: +3.5k lines across 54 files). Not merged yet; #42 is open.",
    notable: [
      { title: "feat: add CNN layers and ChestMNIST MPC training pipeline", href: "https://github.com/0xTCG/sequre/pull/41" },
    ],
  },
  {
    name: "p5.js Web Editor (Processing Foundation)",
    href: "https://github.com/processing/p5.js-web-editor/pulls?q=is%3Apr+author%3Asdivyanshu90+is%3Amerged",
    merged: 4,
    authored: 10,
    role: "Contributor",
    summary:
      "10 PRs (2023–24), 4 merged: a keyboard shortcut for adding files, the Korean translation of keyboard shortcuts, and two UI fixes.",
    notable: [
      { title: "Added a keyboard shortcut for adding files", href: "https://github.com/processing/p5.js-web-editor/pull/2395" },
    ],
  },
  {
    name: "OpenCode (anomalyco/opencode)",
    href: "https://github.com/anomalyco/opencode/pulls?q=is%3Apr+author%3Asdivyanshu90",
    merged: 0,
    authored: 22,
    open: 21,
    role: "In review",
    summary: "22 fix PRs to the open-source AI coding agent (210k★), Aug–Sep 2026 — 21 open, awaiting maintainer review.",
  },
  {
    name: "Also merged: vulnerablecode, Music Blocks, PyNN",
    href: "https://github.com/pulls?q=is%3Apr+author%3Asdivyanshu90+is%3Amerged+-user%3Asdivyanshu90",
    merged: 3,
    authored: 4,
    role: "Contributor",
    summary:
      "A license-URL fix to aboutcode-org/vulnerablecode, a close-button fix to Sugar Labs' Music Blocks, and a docs-layout fix to NeuralEnsemble's PyNN.",
    notable: [
      { title: "Add license_url for GitHub Importer (vulnerablecode)", href: "https://github.com/aboutcode-org/vulnerablecode/pull/1392" },
      { title: "Fixed Close Info Window (Music Blocks)", href: "https://github.com/sugarlabs/musicblocks/pull/3346" },
      { title: "Fix content overflow in doc sidebar (PyNN)", href: "https://github.com/NeuralEnsemble/PyNN/pull/813" },
    ],
  },
  {
    name: "mcp-college-counselor",
    href: "https://github.com/sdivyanshu90/mcp-college-counselor",
    merged: 0,
    role: "Author",
    summary:
      "Agentic admissions advisor — Playwright scraping → SQLite → MCP server → tool-calling client; 39 automated tests.",
  },
  {
    name: "GSoC Explorer",
    href: "https://github.com/sdivyanshu90/GSoC-Explorer",
    merged: 0,
    role: "Author",
    summary:
      "Next.js explorer for five years of Google Summer of Code orgs & projects, SQLite-cached archive API.",
  },
];

/* ------------------------------------------------------------------ */
/* §03 — Changelog (experience as releases)                            */
/* ------------------------------------------------------------------ */

export interface Release {
  version: string;
  span: string;
  role: string;
  org: string;
  orgHref?: string;
  summary: string;
  notes: string[];
  placeholder?: string;
}

export const changelog: Release[] = [
  {
    version: "v3.0",
    span: "May 2026 — present",
    role: "Founding Engineer",
    org: "Uniiq",
    orgHref: "https://uniiq.ai",
    summary:
      "Building Uniiq's AI-powered college-advising platform across React, Express, MongoDB, and Gemini, pairing conversational guidance with professional counselors for global university admissions.",
    notes: [
      "Led the technical turnaround of inherited legacy code, resolving 40+ critical vulnerabilities and adding prompt and response sanitization against injection and data-leak risks.",
      "Reworked student onboarding into a three-phase AI conversation with follow-up questions, persisted transcripts, structured validation, rate limits, and recoverable AI-failure handling.",
      "Implemented role-aware profile-completion enforcement and international phone capture across protected APIs, sign-up, setup, and profile flows.",
      "Expanded institution and opportunity administration with deep-partial updates, nested Mongo normalization, validation, and external-ID uniqueness safeguards; added 1,199 lines of automated tests across 12 modules.",
      "Raised the web performance score from 73 to 93, cut LCP from 3.3s to 0.7s, and reduced INP to 130ms after code-splitting 21 routes and optimizing delivery.",
    ],
  },
  {
    version: "v2.0",
    span: "Oct 2025 — Mar 2026",
    role: "ML Researcher",
    org: "Yale University",
    summary:
      "Privacy-preserving deep learning: a from-scratch DL library built around compiler-centric multi-party computation. See Fig. 02.",
    notes: [
      "88.08% ChestMNIST test accuracy in 5 epochs at batch size 512 — trained under MPC.",
      "No external autograd: layers, backprop and optimizers derived by hand.",
      "CNN stack proposed upstream to 0xTCG/sequre across four pull requests.",
    ],
  },
  {
    version: "v1.0",
    span: "Nov 2022 — Jul 2025",
    role: "Research Consultant",
    org: "WorldQuant BRAIN",
    summary:
      "Quantitative research: high-frequency alpha signals in Python on WorldQuant's simulation stack.",
    notes: [
      "Developed and backtested 15+ alpha signals; average Sharpe ratio 1.8.",
      "GOLD LEVEL (Top 1%) and Stage 1 Qualifier, Global Alphathon 2022.",
    ],
  },
  {
    version: "v0.x",
    span: "2021 — Jun 2025",
    role: "B.E. Computer Science",
    org: "University of Mumbai",
    summary:
      "CGPA 8/10. Coursework: ML, deep learning, DSA, probability & statistics.",
    notes: [
      "Open-source contributions to the Processing Foundation's p5.js Web Editor (4 merged PRs, 2023–24).",
      "4,400+ algorithmic problems: CodeChef 2,957 (3★, rating 1662) and LeetCode 1,466 (contest rating 1,821, top 7.5%).",
    ],
  },
];

/** Education, verbatim from the résumé (also release v0.x above). */
export const education = {
  degree: "B.E. Computer Science",
  school: "University of Mumbai",
  span: "2021 — Jun 2025",
  grade: "CGPA 8/10",
  coursework: "Machine learning, deep learning, data structures & algorithms, probability & statistics",
} as const;

/* ------------------------------------------------------------------ */
/* §04 — Capabilities                                                  */
/* ------------------------------------------------------------------ */

export const capabilities: { area: string; items: string }[] = [
  {
    area: "Languages",
    items:
      "Python (primary) · C++ · TypeScript / JavaScript · Rust · SQL · Bash · Java",
  },
  {
    area: "Modeling & training",
    items:
      "PyTorch · TensorFlow · Keras · scikit-learn · Hugging Face Transformers · PyTorch Geometric · CNNs / GNNs · Whisper · DeBERTa / RoBERTa",
  },
  {
    area: "LLM systems",
    items:
      "Gemini · structured AI outputs · RAG · SFT · LangChain / LangGraph · Model Context Protocol · prompt engineering · Qdrant · Chroma · Ollama",
  },
  {
    area: "Serving & MLOps",
    items:
      "FastAPI · Docker · ONNX · GitHub Actions CI/CD · MLflow · Airflow · AWS (SageMaker, EC2) · GCP · Azure · Streamlit",
  },
  {
    area: "Data",
    items:
      "NumPy · Pandas · Polars · CatBoost · PostgreSQL · MySQL · MongoDB · SQLite",
  },
  {
    area: "Web & product",
    items:
      "React · Next.js · Node.js / Express · Django / Flask · Tailwind CSS · server-sent events · system design",
  },
];

/* ------------------------------------------------------------------ */
/* §05 — Credentials                                                   */
/* ------------------------------------------------------------------ */

export const certifications = [
  {
    name: "Machine Learning Specialization",
    issuer: "DeepLearning.AI",
    year: "2023",
  },
  {
    name: "Deep Learning Specialization",
    issuer: "DeepLearning.AI",
    year: "2023",
  },
  {
    name: "TensorFlow Developer Certificate",
    issuer: "DeepLearning.AI",
    year: "2024",
  },
  { name: "GANs Specialization", issuer: "DeepLearning.AI", year: "2024" },
  { name: "Meta Front-End Developer", issuer: "Coursera", year: "2023" },
  {
    name: "Postman API Fundamentals Student Expert",
    issuer: "Postman",
    year: "2023",
  },
] as const;

export const honors = [
  "GOLD LEVEL (Top 1%) & Stage 1 Qualifier — WorldQuant BRAIN Global Alphathon 2022",
  "Kaggle 2× Expert", // résumé; confirmed by Divanshu 2026-09 (profile is captcha-walled to scrapers)
  "LeetCode contest rating 1,821 (top 7.5%) · CodeChef 3★ (1662) · 4,400+ problems solved",
  "GitHub: Pull Shark ×3 · Starstruck ×2 · YOLO · Quickdraw",
  `${github.publicRepos} public repositories · ${github.stars} stars`,
] as const;

/* ------------------------------------------------------------------ */
/* §06 — Correspondence                                                */
/* ------------------------------------------------------------------ */

export const citation = `@engineer{sharma_2026,
  author   = {Sharma, Divanshu},
  title    = {Machine Learning Engineer — systems from first principles},
  role     = {Founding Engineer, Uniiq},
  email    = {divyanshu74.80@gmail.com},
  url      = {https://div90.vercel.app},
  github   = {${github.user}},
  revision = {2026.07}
}`;

/* ------------------------------------------------------------------ */
/* Derived counts — prose must use these, never hand-typed numbers.    */
/* ------------------------------------------------------------------ */

export const counts = {
  systems: scratchIndex.length,
  engineered: scratchIndex.filter((e) => e.engineered).length,
  caseStudies: caseStudies.length,
  fieldGuides: fieldGuides.length,
  certifications: certifications.length,
  releases: changelog.length,
  /** Every star in the constellation: from-scratch systems + case studies. */
  stars: scratchIndex.length + caseStudies.length + openSource.filter((o) => o.role !== "Author").length,
  /** Bugs he reported with a fix, fixed upstream after a bot closed his PR. */
  reportedFixed: openSource.reduce((n, o) => n + (o.reportedFixed?.length ?? 0), 0),
  /** Every PR he opened in other people's projects (public repos). */
  authoredUpstream: openSource.reduce((n, o) => n + (o.authored ?? 0), 0),
  /** Merged upstream PRs across other people's projects. */
  mergedUpstream: openSource.filter((o) => o.role === "Contributor").reduce((n, o) => n + o.merged, 0),
  inLayer: (layer: Layer) => scratchIndex.filter((e) => e.layer === layer).length,
} as const;
