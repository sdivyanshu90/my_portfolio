import { describe, expect, it } from "vitest";
import { fitSummary, matchRequirement, matchRequirements, splitRequirements } from "@/lib/fit";

describe("requirement matching", () => {
  it("splits a pasted JD into requirement lines, dropping content-free headings", () => {
    const reqs = splitRequirements("About us\n- 4+ years of Python\n• PyTorch; Kubernetes\n1. RAG systems");
    expect(reqs).toEqual(["4+ years of Python", "PyTorch", "Kubernetes", "RAG systems"]);
  });

  it("finds strong evidence for what is on record", () => {
    const r = matchRequirement("Built LLM inference serving with batching and a KV cache");
    expect(r.strength).toBe("strong");
    expect(r.evidence.some((e) => /KV/i.test(e.name))).toBe(true);
    expect(r.evidence[0].url).toMatch(/^https:\/\//);
  });

  it("reports gaps honestly instead of stretching", () => {
    expect(matchRequirement("Kubernetes and Terraform for infrastructure").strength).toBe("gap");
    expect(matchRequirement("Experience mentoring engineers").strength).toBe("gap");
  });

  it("treats an unbulleted first line above bullets as the role title", () => {
    expect(splitRequirements("Senior ML Engineer — LLM Platform\n- PyTorch\n- Kubernetes")).toEqual(["PyTorch", "Kubernetes"]);
  });

  it("summarizes", () => {
    const s = fitSummary(matchRequirements("- PyTorch\n- Kubernetes"));
    expect(s.total).toBe(2);
    expect(s.gap).toBe(1);
  });
});
