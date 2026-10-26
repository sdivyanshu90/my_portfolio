import { describe, expect, it } from "vitest";
import {
  fitSummary,
  matchRequirement,
  matchRequirements,
  splitRequirements,
  parseRequirements,
} from "@/lib/fit";

describe("requirement matching", () => {
  it("splits a pasted JD into requirement lines, dropping content-free headings", () => {
    const reqs = splitRequirements(
      "About us\n- 4+ years of Python\n• PyTorch; Kubernetes\n1. RAG systems",
    );
    expect(reqs).toEqual([
      "4+ years of Python",
      "PyTorch",
      "Kubernetes",
      "RAG systems",
    ]);
  });

  it("finds strong evidence for what is on record", () => {
    const r = matchRequirement(
      "Built LLM inference serving with batching and a KV cache",
    );
    expect(r.strength).toBe("strong");
    expect(r.evidence.some((e) => /KV/i.test(e.name))).toBe(true);
    expect(r.evidence[0].url).toMatch(/^https:\/\//);
  });

  it("reports gaps honestly instead of stretching", () => {
    expect(
      matchRequirement("Kubernetes and Terraform for infrastructure").strength,
    ).toBe("gap");
    expect(matchRequirement("Experience mentoring engineers").strength).toBe(
      "verify",
    );
  });

  it("treats an unbulleted first line above bullets as the role title", () => {
    expect(
      splitRequirements(
        "Senior ML Engineer — LLM Platform\n- PyTorch\n- Kubernetes",
      ),
    ).toEqual(["PyTorch", "Kubernetes"]);
  });

  it("summarizes", () => {
    const s = fitSummary(matchRequirements("- PyTorch\n- Kubernetes"));
    expect(s.total).toBe(2);
    expect(s.gap).toBe(1);
  });
});

describe("evidence scope and requirement semantics", () => {
  it.each(["Python", "PyTorch", "TypeScript", "Node.js"])(
    "recognizes short exact skills: %s",
    (text) => {
      const row = matchRequirement(text);
      expect(row.strength).toBe("strong");
      expect(row.evidence.length).toBeGreaterThan(0);
    },
  );

  it("separates alternatives from cumulative obligations", () => {
    expect(matchRequirement("Python or Go").strength).toBe("strong");
    expect(
      matchRequirement("Python, Scala, Kotlin, C# or C++").missing,
    ).toEqual([]);
    const row = matchRequirement("React and Kubernetes and Terraform");
    expect(row.strength).toBe("partial");
    expect(row.matched).toContain("React");
    expect(row.missing).toEqual(["Kubernetes", "Terraform"]);
  });

  it("does not make a named product mandatory when a comparable alternative is allowed", () => {
    const row = matchRequirement(
      "Supabase or a comparable backend service based on PostgreSQL",
    );
    expect(row.missing).not.toContain("Supabase");
    expect(row.strength).toBe("partial");
  });

  it.each([
    "5+ years of Python",
    "At least two years with PyTorch",
    "US citizenship required",
    "Eligible for visa sponsorship",
    "Experience mentoring engineers",
    "Python systems serving millions of users",
    "Production quantization",
    "Deploying the Admissions Decision Twin in production",
  ])("keeps unproven qualifiers visible: %s", (text) => {
    const row = matchRequirement(text);
    expect(row.strength).toBe("verify");
    expect(row.needsVerification.length).toBeGreaterThan(0);
  });

  it("distinguishes implementation from deployment evidence", () => {
    expect(matchRequirement("Quantization").strength).toBe("strong");
    expect(
      matchRequirement("Production quantization").needsVerification.join(" "),
    ).toMatch(/Production use/);
    expect(matchRequirement("Production React and MongoDB").strength).toBe(
      "strong",
    );
  });

  it("checks degrees without reading the verb 'be' as a B.E.", () => {
    expect(
      matchRequirement("Bachelor's degree in Computer Science").strength,
    ).toBe("strong");
    expect(
      matchRequirement("Bachelor's or master's degree in Computer Science")
        .strength,
    ).toBe("strong");
    expect(matchRequirement("PhD required").strength).toBe("gap");
    expect(matchRequirement("Be proficient with Node.js").matched).toEqual([
      "Node.js",
    ]);
  });

  it("uses Decision Twin evaluation methodology without claiming a deployment", () => {
    const row = matchRequirement("Human judgment and evaluation datasets");
    expect(row.strength).toBe("strong");
    expect(row.evidence.some((e) => /uniiq-platform/.test(e.url))).toBe(true);
    expect(matchRequirement("Human judgment in production").strength).toBe(
      "verify",
    );
  });

  it("preserves required versus preferred and skips benefits", () => {
    const parsed = parseRequirements(
      "Required qualifications:\nPython\nPreferred qualifications:\nKubernetes\nBenefits:\nFree meals\nPaid vacation",
    );
    expect(parsed.requirements).toEqual([
      { text: "Python", priority: "required" },
      { text: "Kubernetes", priority: "preferred" },
    ]);
    const summary = fitSummary(
      matchRequirements(
        "Requirements:\nPython\n5 years of PyTorch\nPreferred qualifications:\nKubernetes",
      ),
    );
    expect(summary.required).toMatchObject({
      total: 2,
      strong: 1,
      verify: 1,
      gap: 0,
    });
    expect(summary.preferred).toMatchObject({ total: 1, gap: 1 });
  });

  it("keeps first-line requirements and short technology names", () => {
    expect(splitRequirements("Python required\n- Go\n- C++\n- C#")).toEqual([
      "Python required",
      "Go",
      "C++",
      "C#",
    ]);
  });

  it("reports truncation and deduplicates repeated requirements", () => {
    expect(parseRequirements("Python\nPython").requirements).toHaveLength(1);
    const parsed = parseRequirements(
      Array.from({ length: 65 }, (_, i) => `Requirement ${i}: Python`).join(
        "\n",
      ),
    );
    expect(parsed.requirements).toHaveLength(60);
    expect(parsed.truncated).toBe(true);
  });
});

describe("post-review safeguards", () => {
  it("does not let PostgreSQL alone establish data-modeling depth", () => {
    const row = matchRequirement("PostgreSQL and data modeling");
    expect(row.strength).toBe("partial");
    expect(row.matched).toContain("Data modeling");
  });
  it("recognizes evidenced engineering practices", () => {
    expect(
      matchRequirement("Git and its collaboration workflows").strength,
    ).toBe("strong");
    expect(
      matchRequirement("Defensive coding and handling edge cases").strength,
    ).toBe("strong");
  });
  it("preserves alternatives across a longer optional topic list", () => {
    const row = matchRequirement(
      "Familiarity with quantization, FlashAttention, kernel fusion, memory hierarchies, C++, CUDA or systems programming",
    );
    expect(row.strength).toBe("strong");
    expect(row.missing).toEqual([]);
  });
});

describe("persona audit regressions", () => {
  it.each([
    "Python and COBOL",
    "Python and cobol",
    "Python and FlubberDB",
    "Python and Ruby",
  ])("keeps unrecognized named obligations visible: %s", (text) => {
    const row = matchRequirement(text);
    expect(row.strength).toBe("verify");
    expect(row.matched).toContain("Python");
    expect(row.needsVerification.join(" ")).toContain("Unassessed term");
  });
  it.each([
    "Bachelor degree in Chemistry",
    "Bachelor's degree in Physics",
    "Bachelor degree in Computer Science and Chemistry",
  ])("checks degree subject: %s", (text) => {
    expect(matchRequirement(text).strength).toBe("verify");
  });
  it.each([
    "No Kubernetes experience required",
    "Kubernetes experience is not required",
  ])("does not turn waived experience into a gap: %s", (text) => {
    const row = matchRequirement(text);
    expect(row.strength).toBe("verify");
    expect(row.missing).toEqual([]);
  });
  it("distinguishes an ambiguous slash from an explicit alternative", () => {
    expect(matchRequirement("Python/Kubernetes").strength).toBe("verify");
    expect(matchRequirement("Python or Kubernetes").strength).toBe("strong");
    expect(matchRequirement("Python and Kubernetes").strength).toBe("partial");
    expect(matchRequirement("React/TypeScript").strength).toBe("strong");
  });
  it.each(["What you will need:", "What you'll need:", "Your toolkit:"])(
    "resumes after benefits at %s",
    (heading) => {
      expect(
        splitRequirements(
          `Benefits:\nFree meals\n${heading}\nPython and TypeScript`,
        ),
      ).toEqual(["Python and TypeScript"]);
    },
  );
  it("keeps private engineering evidence attributed", () => {
    expect(
      matchRequirement("React and MongoDB").evidence.find((e) =>
        e.url.endsWith("/uniiq-platform"),
      )?.scope,
    ).toBe("Private engineering summary");
  });
});

it.each([
  "No fewer than five years of Python required",
  "No less than three years of Python required",
])("preserves a duration expressed with negation: %s", (text) => {
  const row = matchRequirement(text);
  expect(row.matched).toContain("Python");
  expect(row.needsVerification.join(" ")).toContain("duration");
  expect(row.explanation).not.toContain("waives");
});
