/**
 * Pre-written narrations for every preset query — the most-travelled paths
 * answer instantly (trace: `synthesis: cached`) with no model dependency.
 * Every sentence is grounded in the dossier; tone matches the preset's mode.
 */
export const PRESET_ANSWERS: Record<string, string> = {
  // — Recruiter —
  "Give me the 30-second pitch":
    "Divanshu Sharma is a machine learning engineer who proves depth by rebuilding: 37 working reimplementations of the modern AI stack, published as tested repositories. Track record: privacy-preserving deep learning research at Yale (88.08% ChestMNIST accuracy under multi-party computation), three years of quant research at WorldQuant BRAIN (15+ alphas, Sharpe 1.8, Gold — Top 1% — in the 2022 Global Alphathon), and now Founding Engineer at Uniiq, where he builds an AI college-advising platform across React, Express, MongoDB, and Gemini. Open to AI engineering and founding roles.",
  "Is he available, and for what roles?":
    "Yes — open to AI engineering and founding roles (his own words, from his GitHub bio). He is currently a Founding Engineer at Uniiq and based in Mumbai, India; remote-friendly. The fastest route is email — replies typically within a day. Details and direct lines are on the card below.",
  "Show the experience timeline":
    "Four releases, below: v0.x — B.E. Computer Science, University of Mumbai (CGPA 8/10, 2025). v1.0 — Research Consultant at WorldQuant BRAIN (Nov 2022–Jul 2025): 15+ backtested alpha signals, average Sharpe 1.8, Gold level (Top 1%) at the 2022 Global Alphathon. v2.0 — ML Researcher at Yale (Oct 2025–Mar 2026): a from-scratch deep learning library built around compiler-centric multi-party computation. v3.0 — Founding Engineer at Uniiq, building and stabilizing its full-stack AI college-advising platform.",
  "What are his credentials?":
    "On record: six certifications — the Machine Learning and Deep Learning Specializations, TensorFlow Developer Certificate, and GANs Specialization (all DeepLearning.AI), Meta Front-End Developer, and Postman API Fundamentals. Honors: Gold level (Top 1%) and Stage 1 Qualifier at the WorldQuant Global Alphathon 2022, Kaggle 2× Expert, LeetCode Knight, CodeChef max rating 1662, and 3,000+ algorithmic problems solved.",
  "Where is the résumé?":
    "One page, PDF, revised May 2026 — the download is below, and it's also pinned in the header so it's never more than one click away.",

  // — Engineer —
  "What has he built from scratch?":
    "Thirty-seven systems, each a standalone documented repo — filter the index below by layer. New highlights include a 216-test Whisper-style ASR stack, a typed sparse-autoencoder interpretability toolkit with causal interventions, and a hardened CLIP embedding service. Alongside them: transformers and diffusion, RLHF/DPO/PEFT trainers, a Rust ONNX inference server, a vLLM-style paged KV-cache, INT8/FP4/NF4 quantization, HNSW retrieval, agent runtimes, function routing, and an LLM eval harness with crash-safe artifacts.",
  "Show the inference & serving work":
    "Eight systems in this layer, below. The Rust inference server pairs ONNX Runtime with Axum and ships backpressure, graceful shutdown, and Prometheus metrics. The paged KV-cache engine reimplements vLLM's core: page tables, copy-on-write forking, a radix prefix cache, and continuous batching. Alongside: speculative decoding, composable logit processing, prompt caching, INT8/FP4/NF4 quantization, a multi-provider AI gateway, and funcflow — a TypeScript function router with dependency-aware plans, parallel execution, retries, and provider fallbacks.",
  "How did the 0.00% CER OCR pipeline work?":
    "Three chained stages against 16th–17th-century Spanish print: CRAFT text detection, an SE-ResNet-BiLSTM CRNN recognizer decoded with beam search, and a RoBERTa-based post-processor. The scarce-data problem — 183 labeled pages — was solved with a 7-step, augmentation-heavy preprocessing workflow tuned to period degradation, scaling training to 12,792 samples. Result: full-corpus word accuracy lifted from 97.96% to 98.17%, and character error rate driven from 3.44% to 0.00% on the held-out validation set. Full figure below.",
  "Show the Yale MPC research":
    "The problem: institutions with sensitive data can't pool it for training. His approach at Yale: engineer a deep learning library from first principles in Python/NumPy — no external autograd; layers, backprop and optimizers derived by hand — around a compiler-centric multi-party computation architecture, so collaborative training carries verifiable cryptographic guarantees. A strided-convolution CNN reached 88.08% ChestMNIST test accuracy in 5 epochs at batch size 512, trained under MPC. The CNN stack was proposed upstream to 0xTCG/sequre across four pull requests.",
  "What is his stack?":
    "Python-first, with C++, TypeScript, Rust, SQL and Bash. Modeling: PyTorch, TensorFlow, Hugging Face Transformers, PyTorch Geometric. LLM systems: RAG, LangChain/LangGraph, the Model Context Protocol, Qdrant and Chroma. Serving and MLOps: FastAPI, Docker, ONNX, GitHub Actions, MLflow, Airflow, AWS SageMaker/EC2, GCP. Product: React, Next.js, Node. The full matrix, by layer, is below.",

  // — Founder —
  "What is he doing at Uniiq?":
    "He's a Founding Engineer at Uniiq, where he led the turnaround of an AWS-deployed AI onboarding platform across React, Express, MongoDB, and Gemini. He resolved 40+ critical vulnerabilities, added prompt and response sanitization, and delivered a three-phase conversational intake with persisted transcripts and recoverable AI failures. He also expanded student and admin workflows, added 1,199 lines of tests across 12 modules, and raised the web performance score from 73 to 93 while cutting LCP from 3.3s to 0.7s.",
  "Show shipped systems with measured results":
    "The 0→1 ledger, below — built end-to-end, not studied. At Uniiq, he is a Founding Engineer across the full-stack AI product; this console itself was shipped solo with a deterministic fallback and an injection firewall; a knowledge-graph query engine covers 21,393 SAP records with layered guardrails; an agentic admissions advisor has 39 tests; and a historical-OCR pipeline reached 98.17% full-corpus word accuracy. Ownership over coursework.",
  "How does he think about evaluation?":
    "Evaluation is the through-line of his work, not an afterthought. His Hindi ASR project made the evaluation itself the contribution — fusing five models through word-level confusion networks so the transcript is a measured consensus. He built EvalForge, an LLM eval harness from scratch: JSONL datasets, provider adapters, scorers, crash-safe artifacts. His agent curriculum embeds attack scenarios and eval harnesses into every module. Even this portfolio shows its trace and sources on every answer.",
  "What open-source work has he done?":
    "Four upstream pull requests proposing CNN layers and an MPC training pipeline to 0xTCG/sequre (Yale-adjacent secure-computing framework); 6+ high-priority bug fixes and 12+ responsiveness fixes in the Processing Foundation's p5.js Web Editor; and 165 public repositories including ten teaching curricula — MCP, agents, LangGraph, system design, LLD, and graph algorithms — plus the 37-system from-scratch index. Details below.",
  "How do I contact him?":
    "Email is fastest: divyanshu74.80@gmail.com — replies typically within a day. Phone: +91-9594506208. The résumé PDF, GitHub (the deepest record), LinkedIn, Kaggle, LeetCode and CodeChef are all on the card below.",
};
