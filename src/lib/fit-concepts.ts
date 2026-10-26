import { capabilities } from "@/data/portfolio";

/** Exact aliases, not similarity claims: Kubernetes is never an alias for Docker. */
export interface FitConcept {
  name: string;
  aliases: string[];
}
const groups: [string, string[]][] = [
  ["Python", ["python"]],
  ["JavaScript", ["javascript", "js"]],
  ["TypeScript", ["typescript"]],
  ["Go", ["golang", "go"]],
  ["C++", ["c++", "cpp"]],
  ["C#", ["c#", "csharp"]],
  ["Node.js", ["node.js", "nodejs"]],
  ["React", ["react", "react.js", "reactjs"]],
  ["Next.js", ["next.js", "nextjs"]],
  ["PostgreSQL", ["postgresql", "postgres"]],
  ["Kubernetes", ["kubernetes", "k8s"]],
  ["Terraform", ["terraform"]],
  ["Hugging Face Transformers", ["hugging face", "huggingface"]],
  ["AWS", ["aws", "amazon web services"]],
  ["GCP", ["gcp", "google cloud"]],
  [
    "LLMs",
    [
      "llm",
      "llms",
      "large language model",
      "large language models",
      "language models",
    ],
  ],
  [
    "RAG",
    ["rag", "retrieval augmented generation", "retrieval-augmented generation"],
  ],
  [
    "Vector databases",
    ["vector database", "vector databases", "vector indexes", "vector search"],
  ],
  [
    "LLM evaluation",
    [
      "llm evaluation",
      "llm evaluations",
      "model evaluation",
      "model evaluations",
      "evaluation harness",
      "evaluating llms",
      "evaluating models",
    ],
  ],
  [
    "AI agents",
    [
      "ai agents",
      "agentic",
      "multi-agent",
      "agent workflows",
      "agent systems",
      "llm-based agents",
    ],
  ],
  ["Guardrails", ["guardrails", "prompt injection", "prompt-injection"]],
  [
    "Structured outputs",
    ["structured outputs", "structured output", "schema-validated extraction"],
  ],
  ["KV cache", ["kv cache", "kv-cache", "kv caching"]],
  ["Batching", ["batching"]],
  ["Quantization", ["quantization", "quantisation"]],
  [
    "Inference serving",
    ["inference serving", "model serving", "inference server"],
  ],
  [
    "Distributed training",
    [
      "distributed training",
      "fsdp",
      "zero-3",
      "tensor parallelism",
      "tensor-parallel",
    ],
  ],
  ["Fine-tuning", ["fine-tuning", "fine tuning", "finetuning", "fine-tuned"]],
  ["LoRA", ["lora"]],
  ["QLoRA", ["qlora"]],
  ["RLHF", ["rlhf"]],
  ["DPO", ["dpo"]],
  ["Machine learning", ["machine learning", "ml"]],
  ["Deep learning", ["deep learning"]],
  ["Computer vision", ["computer vision", "image classification"]],
  ["NLP", ["nlp", "natural language processing"]],
  ["Data structures", ["data structures"]],
  ["Algorithms", ["algorithms", "algorithmic"]],
  ["CI/CD", ["ci/cd", "continuous integration", "continuous delivery"]],
  ["Observability", ["observability", "distributed tracing"]],
  ["REST APIs", ["rest api", "rest apis", "restful"]],
  ["SQL", ["sql"]],
  ["NoSQL", ["nosql"]],
  ["Backend development", ["backend", "back-end", "backends"]],
  ["Full-stack development", ["full-stack", "full stack", "fullstack"]],
  ["Spark", ["spark", "pyspark"]],
  ["Kafka", ["kafka"]],
  ["dbt", ["dbt"]],
  ["Snowflake", ["snowflake"]],
  ["Databricks", ["databricks"]],
  ["Redis", ["redis"]],
  ["Elasticsearch", ["elasticsearch"]],
  ["GraphQL", ["graphql"]],
  ["CUDA", ["cuda"]],
  ["Triton", ["triton"]],
  ["TensorRT", ["tensorrt"]],
  ["JAX", ["jax"]],
  ["vLLM", ["vllm"]],
  ["Linux", ["linux"]],
  ["XGBoost", ["xgboost"]],
  ["NLTK", ["nltk"]],
  ["SpaCy", ["spacy"]],
  ["Supabase", ["supabase"]],
  ["Transformer architectures", ["transformer architectures", "transformers"]],
  ["Retrieval", ["retrieval"]],
  ["Chunking", ["chunking"]],
  ["Embeddings", ["embeddings", "embedding"]],
  ["Hybrid search", ["hybrid search"]],
  ["Reranking", ["reranking", "re-ranking"]],
  ["Metadata filters", ["metadata filters", "metadata filtering"]],
  ["Model registries", ["model registries", "model registry"]],
  ["Feature stores", ["feature stores", "feature store"]],
  [
    "Model versioning",
    ["model versioning", "versioned models", "model-version tracking"],
  ],
  ["Experiment tracking", ["experiment tracking", "mlflow"]],
  ["Monitoring", ["monitoring", "observability"]],
  ["Automated retraining", ["automated retraining", "automatic retraining"]],
  [
    "Evaluation datasets",
    [
      "representative datasets",
      "evaluation datasets",
      "frozen inputs",
      "frozen decision artifacts",
    ],
  ],
  ["Evaluation graders", ["graders", "scorers", "scoring rules"]],
  ["Production feedback", ["production feedback"]],
  ["Human evaluation", ["human judgment", "independent metric review"]],
  ["Git", ["git"]],
  ["Storage systems", ["storage systems", "storage"]],
  ["Data processing", ["data-processing", "data processing"]],
  ["Cloud infrastructure", ["cloud infrastructure"]],
  ["Data modeling", ["data modeling", "data modelling"]],
  ["Defensive coding", ["defensive coding", "edge cases"]],
  [
    "Backend performance",
    [
      "demanding performance requirements",
      "backend performance",
      "backend throughput",
    ],
  ],
  ["FlashAttention", ["flashattention"]],
  ["Kernel fusion", ["kernel fusion"]],
  ["Memory hierarchies", ["memory hierarchies"]],
  ["Systems programming", ["systems programming"]],
  ["GStreamer", ["gstreamer"]],
  ["WebRTC", ["webrtc"]],
  ["Scala", ["scala"]],
  ["Kotlin", ["kotlin"]],
];

export const FIT_CONCEPTS: FitConcept[] = groups.map(([name, aliases]) => ({
  name,
  aliases,
}));
// Keep named technologies aligned with the portfolio's actual skills inventory.
for (const area of capabilities) {
  for (const raw of area.items.split(" · ")) {
    for (const part of raw.split(/\s+\/\s+/)) {
      const name = part.replace(/\s*\([^)]*\)/g, "").trim();
      if (
        name &&
        !FIT_CONCEPTS.some((c) => c.aliases.includes(name.toLowerCase()))
      ) {
        FIT_CONCEPTS.push({ name, aliases: [name.toLowerCase()] });
      }
    }
  }
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function conceptPattern(c: FitConcept): RegExp {
  return new RegExp(
    `(?<![a-z0-9])(?:${c.aliases
      .map(escape)
      .sort((a, b) => b.length - a.length)
      .join("|")})(?![a-z0-9+#])`,
    "gi",
  );
}

export interface ConceptMention {
  concept: FitConcept;
  start: number;
  end: number;
}
export function conceptMentions(text: string): ConceptMention[] {
  const found: ConceptMention[] = [];
  for (const concept of FIT_CONCEPTS) {
    for (const m of text.matchAll(conceptPattern(concept))) {
      // Lower-case "go" is usually a verb in prose; accept an isolated skill or explicit Go/Golang.
      if (
        concept.name === "Go" &&
        m[0] === "go" &&
        text.trim().toLowerCase() !== "go"
      )
        continue;
      found.push({ concept, start: m.index!, end: m.index! + m[0].length });
    }
  }
  // Prefer "LLM evaluation" over an overlapping generic "LLM" mention.
  const longest = found.sort((a, b) => b.end - b.start - (a.end - a.start));
  const selected: ConceptMention[] = [];
  for (const m of longest)
    if (!selected.some((x) => m.start < x.end && m.end > x.start))
      selected.push(m);
  return selected.sort((a, b) => a.start - b.start);
}
