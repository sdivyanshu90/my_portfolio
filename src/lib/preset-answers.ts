import { counts, personal, uniiqDecisionTwin, openSourceSummary } from "@/data/portfolio";
import { Spell, spell } from "@/lib/words";

/**
 * Pre-written narrations for every preset query — the most-travelled paths
 * answer instantly (trace: `synthesis: cached`) with no model dependency.
 * Every sentence is grounded in the dossier; tone matches the preset's mode.
 * Counts come from `counts` — never hand-type a number the data can supply.
 */
export const PRESET_ANSWERS: Record<string, string> = {
  // — Recruiter —
  "Give me the 30-second pitch":
    `Divanshu Sharma is a founding engineer who ships reliable AI products. At Uniiq he owns the AI admissions platform across React, Express, MongoDB and Gemini: a stateful intake hardened so model failures can't corrupt student state, an 80.8% smaller frontend entry bundle, and a Decision Twin designed and validated across 30 applicant scenarios in controlled offline evaluation. Before that: privacy-preserving deep learning research at Yale (88.08% ChestMNIST accuracy under multi-party computation) and three years of quant research at WorldQuant BRAIN (15+ alphas, Sharpe 1.8, Gold — Top 1% — in the 2022 Global Alphathon). The depth behind it: ${counts.mergedUpstream} merged upstream PRs to AI infrastructure — Mastra, EleutherAI's lm-evaluation-harness — and ${counts.systems} from-scratch reimplementations of the modern AI stack. His focus: LLM evaluation, inference and reliability. Open to AI engineering and founding roles.`,
  "Is he available, and for what roles?":
    "Yes — open to AI engineering and founding roles, and actively looking (confirmed September 2026). He is currently a Founding Engineer at Uniiq.ai and based in Mumbai, India; remote-friendly. The fastest route is email — replies typically within a day. Details and direct lines are on the card below.",
  "Show the experience timeline":
    `${Spell(counts.releases)} releases, below: v0.x — B.E. Computer Science, University of Mumbai (CGPA 8/10, 2025). v1.0 — Research Consultant at WorldQuant BRAIN (Nov 2022–Jul 2025): 15+ backtested alpha signals, average Sharpe 1.8, Gold level (Top 1%) at the 2022 Global Alphathon. v2.0 — ML Researcher at Yale (Oct 2025–Mar 2026): a from-scratch deep learning library built around compiler-centric multi-party computation. v3.0 — Founding Engineer at Uniiq.ai, building and stabilizing its full-stack AI college-advising platform.`,
  "What are his credentials?":
    `On record: ${spell(counts.certifications)} certifications — the Machine Learning and Deep Learning Specializations, TensorFlow Developer Certificate, and GANs Specialization (all DeepLearning.AI), Meta Front-End Developer, and Postman API Fundamentals. Honors: Gold level (Top 1%) and Stage 1 Qualifier at the WorldQuant Global Alphathon 2022, Kaggle 2× Expert, a LeetCode contest rating of 1,821 (top 7.5%), CodeChef 3★ (1662), and 4,400+ algorithmic problems solved across the two.`,
  "Where is the résumé?":
    "The résumé download is below. The /cv page contains the latest experience and results.",

  // — Engineer —
  "Tell me about the Admissions Decision Twin":
    `At Uniiq.ai: ${uniiqDecisionTwin.summary} ${uniiqDecisionTwin.evaluation} ${uniiqDecisionTwin.methodology}`,
  "What has he built from scratch?":
    `${Spell(counts.systems)} systems, each a standalone documented repo — filter the index below by layer. New highlights include a 216-test Whisper-style ASR stack, a typed sparse-autoencoder interpretability toolkit with causal interventions, and a hardened CLIP embedding service. Alongside them: transformers and diffusion, RLHF/DPO/PEFT trainers, a Rust ONNX inference server, a vLLM-style paged KV-cache, INT8/FP4/NF4 quantization, HNSW retrieval, agent runtimes, function routing, and an LLM eval harness with crash-safe artifacts.`,
  "Show the inference & serving work":
    `${Spell(counts.inLayer("Inference & serving"))} systems in this layer, below. The Rust inference server pairs ONNX Runtime with Axum and ships backpressure, graceful shutdown, and Prometheus metrics. The paged KV-cache engine reimplements vLLM's core: page tables, copy-on-write forking, a radix prefix cache, and continuous batching. Alongside: speculative decoding, composable logit processing, prompt caching, INT8/FP4/NF4 quantization, a multi-provider AI gateway, and funcflow — a TypeScript function router with dependency-aware plans, parallel execution, retries, and provider fallbacks.`,
  "How did the 0.00% CER OCR pipeline work?":
    "Three chained stages against 16th–17th-century Spanish print: CRAFT text detection, an SE-ResNet-BiLSTM CRNN recognizer decoded with beam search, and a RoBERTa-based post-processor. The scarce-data problem — 183 labeled pages — was solved with a 7-step, augmentation-heavy preprocessing workflow tuned to period degradation, scaling training to 12,792 samples. Result: full-corpus word accuracy lifted from 97.96% to 98.17%, and character error rate driven from 3.44% to 0.00% on the held-out validation set. Full figure below.",
  "Show the Yale MPC research":
    "The problem: institutions with sensitive data can't pool it for training. His approach at Yale: engineer a deep learning library from first principles in Python/NumPy — no external autograd; layers, backprop and optimizers derived by hand — around a compiler-centric multi-party computation architecture, so collaborative training carries verifiable cryptographic guarantees. A strided-convolution CNN reached 88.08% ChestMNIST test accuracy in 5 epochs at batch size 512, trained under MPC. The CNN stack was proposed upstream to 0xTCG/sequre across four pull requests.",
  "What is his stack?":
    "Python-first, with C++, TypeScript, Rust, SQL and Bash. Modeling: PyTorch, TensorFlow, Hugging Face Transformers, PyTorch Geometric. LLM systems: RAG, LangChain/LangGraph, the Model Context Protocol, Qdrant and Chroma. Serving and MLOps: FastAPI, Docker, ONNX, GitHub Actions, MLflow, Airflow, AWS SageMaker/EC2, GCP. Product: React, Next.js, Node. The full matrix, by layer, is below.",

  // — Founder —
  "What is he doing at Uniiq?":
    "He's a Founding Engineer at Uniiq.ai, owning a stateful admissions workflow across React, Express, MongoDB and Gemini: 3 conversational phases, 9 adaptive follow-ups and 2 authenticated APIs with persisted transcripts and resumable sessions. Structured outputs, up to 3 attempts for transient failures, recoverable 503 responses, deterministic fallbacks and 5 rate policies harden model execution. He cut the primary entry bundle 80.8% (1.45 MB to 278 KB; 81 KB gzipped). Separately, he designed and validated an Admissions Decision Twin across 5 hard constraints. A controlled offline evaluation of 30 scenarios and 60 frozen artifacts raised feasible plans from 23.3% to 76.7%, reduced critical violations from 70% to 0%, and achieved 100% evidence traceability and uncertainty handling. These are evaluation results, not production outcomes.",
  "Show shipped systems with measured results":
    "The 0→1 ledger, below — built end-to-end, not studied. At Uniiq, he owns the full-stack AI admissions platform — a hardened intake with resumable sessions and model failure recovery; this console itself was shipped solo with a deterministic fallback and an injection firewall; a knowledge-graph query engine covers 21,393 SAP records with layered guardrails; an agentic admissions advisor has 39 tests; and a historical-OCR pipeline reached 98.17% full-corpus word accuracy. Ownership over coursework.",
  "How does he think about evaluation?":
    "Evaluation is the through-line of his work, not an afterthought. His Hindi ASR project made the evaluation itself the contribution — fusing five models through word-level confusion networks so the transcript is a measured consensus. He built EvalForge, an LLM eval harness from scratch: JSONL datasets, provider adapters, scorers, crash-safe artifacts. His agent curriculum embeds attack scenarios and eval harnesses into every module. Even this portfolio shows its trace and sources on every answer.",
  "What open-source work has he done?":
    openSourceSummary,
  "How do I contact him?":
    `Email is fastest: ${personal.email} — replies typically within a day. The résumé PDF, GitHub (the deepest record), LinkedIn, Kaggle, LeetCode and CodeChef are all on the card below.`,
};
