/**
 * Pre-written narrations for every preset query — the most-travelled paths
 * answer instantly (trace: `synthesis: cached`) with no model dependency.
 * Every sentence is grounded in the dossier; tone matches the preset's mode.
 */
export const PRESET_ANSWERS: Record<string, string> = {
  // — Recruiter —
  "Give me the 30-second pitch":
    "Divanshu Sharma is a machine learning engineer who proves depth by rebuilding: 31 working reimplementations of the modern AI stack, published as tested repositories. Track record: privacy-preserving deep learning research at Yale (88.08% ChestMNIST accuracy under multi-party computation), three years of quant research at WorldQuant BRAIN (15+ alphas, Sharpe 1.8, Gold — Top 1% — in the 2022 Global Alphathon), and now CTO at Uniiq, an AI-powered college advising platform. Open to AI engineering and founding roles.",
  "Is he available, and for what roles?":
    "Yes — open to AI engineering and founding roles (his own words, from his GitHub bio). He is currently CTO at Uniiq and based in Navi Mumbai, India; remote-friendly. The fastest route is email — replies typically within a day. Details and direct lines are on the card below.",
  "Show the experience timeline":
    "Four releases, below: v0.x — B.E. Computer Science, University of Mumbai (CGPA 8/10, 2025). v1.0 — Research Consultant at WorldQuant BRAIN (Nov 2022–Jul 2025): 15+ backtested alpha signals, average Sharpe 1.8, Gold level (Top 1%) at the 2022 Global Alphathon. v2.0 — ML Researcher at Yale (Oct 2025–Mar 2026): a from-scratch deep learning library built around compiler-centric multi-party computation. v3.0 — CTO at Uniiq, leading engineering on an AI college-advising platform.",
  "What are his credentials?":
    "On record: six certifications — the Machine Learning and Deep Learning Specializations, TensorFlow Developer Certificate, and GANs Specialization (all DeepLearning.AI), Meta Front-End Developer, and Postman API Fundamentals. Honors: Gold level (Top 1%) and Stage 1 Qualifier at the WorldQuant Global Alphathon 2022, Kaggle 2× Expert, LeetCode Knight, CodeChef max rating 1662, and 3,000+ algorithmic problems solved.",
  "Where is the résumé?":
    "One page, PDF, revised May 2026 — the download is below, and it's also pinned in the header so it's never more than one click away.",

  // — Engineer —
  "What has he built from scratch?":
    "Thirty-one systems, each a standalone documented repo — filter the index below by layer. Highlights: a transformer and production-grade ViT with ONNX serving; DDPM/DDIM diffusion with no `diffusers`; RLHF (reward model + PPO) and DPO trainers; a PEFT library covering LoRA, DoRA, VeRA, IA³ and adapters at mypy-strict, ~96% coverage; a Rust inference server on ONNX Runtime and Axum; a vLLM-style paged KV-cache with copy-on-write forking and a radix prefix cache; an INT8/FP4/NF4 quantization library; an HNSW vector index with recall >0.95; and an LLM eval harness with crash-safe artifacts.",
  "Show the inference & serving work":
    "Seven systems in this layer, below. The Rust inference server pairs ONNX Runtime with Axum and ships backpressure, graceful shutdown, and Prometheus metrics. The paged KV-cache engine reimplements vLLM's core: fixed-size physical blocks with per-sequence page tables, ref-counted copy-on-write forking, a radix-tree prefix cache, and a continuous-batching scheduler. Alongside: speculative decoding with acceptance sampling, a composable logit processor, prefix-aware prompt caching, an INT8/FP4/NF4 quantization library with KL and MSE calibration, and a multi-provider AI gateway in TypeScript.",
  "How did the 0.00% CER OCR pipeline work?":
    "Three chained stages against 16th–17th-century Spanish print: CRAFT text detection, an SE-ResNet-BiLSTM CRNN recognizer decoded with beam search, and a RoBERTa-based post-processor. The scarce-data problem — 183 labeled pages — was solved with a 7-step, augmentation-heavy preprocessing workflow tuned to period degradation, scaling training to 12,792 samples. Result: full-corpus word accuracy lifted from 97.96% to 98.17%, and character error rate driven from 3.44% to 0.00% on the held-out validation set. Full figure below.",
  "Show the Yale MPC research":
    "The problem: institutions with sensitive data can't pool it for training. His approach at Yale: engineer a deep learning library from first principles in Python/NumPy — no external autograd; layers, backprop and optimizers derived by hand — around a compiler-centric multi-party computation architecture, so collaborative training carries verifiable cryptographic guarantees. A strided-convolution CNN reached 88.08% ChestMNIST test accuracy in 5 epochs at batch size 512, trained under MPC. The CNN stack was proposed upstream to 0xTCG/sequre across four pull requests.",
  "What is his stack?":
    "Python-first, with C++, TypeScript, Rust, SQL and Bash. Modeling: PyTorch, TensorFlow, Hugging Face Transformers, PyTorch Geometric. LLM systems: RAG, LangChain/LangGraph, the Model Context Protocol, Qdrant and Chroma. Serving and MLOps: FastAPI, Docker, ONNX, GitHub Actions, MLflow, Airflow, AWS SageMaker/EC2, GCP. Product: React, Next.js, Node. The full matrix, by layer, is below.",

  // — Founder —
  "What is he doing at Uniiq?":
    "He's CTO at Uniiq, an AI-powered college-advising platform that pairs AI with professional counselors for global university admissions — he owns the platform's AI systems and engineering direction. Relevant prior signal: he'd already built an end-to-end agentic admissions advisor (Playwright scraping → SQLite → MCP server → tool-calling client, 39 automated tests) before taking the role.",
  "Show shipped systems with measured results":
    "The 0→1 ledger, below — built end-to-end, not studied. Uniiq (he's CTO, owns the AI systems); this console itself, shipped solo with a deterministic fallback and an injection firewall; a knowledge-graph query engine over 21,393 SAP records with layered guardrails; an agentic admissions advisor (Playwright → SQLite → MCP → tool-calling client, 39 tests); a historical-OCR pipeline at 98.17% full-corpus word accuracy; and a GSoC data explorer. Ownership over coursework.",
  "How does he think about evaluation?":
    "Evaluation is the through-line of his work, not an afterthought. His Hindi ASR project made the evaluation itself the contribution — fusing five models through word-level confusion networks so the transcript is a measured consensus. He built EvalForge, an LLM eval harness from scratch: JSONL datasets, provider adapters, scorers, crash-safe artifacts. His agent curriculum embeds attack scenarios and eval harnesses into every module. Even this portfolio shows its trace and sources on every answer.",
  "What open-source work has he done?":
    "Four upstream pull requests proposing CNN layers and an MPC training pipeline to 0xTCG/sequre (Yale-adjacent secure-computing framework); 6+ high-priority bug fixes and 12+ responsiveness fixes in the Processing Foundation's p5.js Web Editor; and 160 public repositories including eight teaching curricula — MCP, agents, LangGraph, system design — plus the 31-system from-scratch index. Details below.",
  "How do I contact him?":
    "Email is fastest: divyanshu74.80@gmail.com — replies typically within a day. Phone: +91-9594506208. The résumé PDF, GitHub (the deepest record), LinkedIn, Kaggle, LeetCode and CodeChef are all on the card below.",
};
