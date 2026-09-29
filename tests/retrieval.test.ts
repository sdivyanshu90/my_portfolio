import { describe, expect, it } from "vitest";
import { allDocs, detectAbsence, search, starRelevance, tokens } from "@/lib/retrieval";
import { caseStudies, scratchIndex } from "@/data/portfolio";

describe("tokens", () => {
  it("normalizes accents, stems, and drops stopwords", () => {
    expect(tokens("Where is the résumé?")).toEqual(["resume"]);
    expect(tokens("shipped deploying tests")).toEqual(["ship", "deploy", "test"]);
    expect(tokens("C++ and Node.js")).toEqual(["cpp", "node"]);
  });
});

describe("index", () => {
  it("covers every star in the constellation", () => {
    const stars = new Set(allDocs().flatMap((d) => (d.star ? [d.star] : [])));
    for (const e of scratchIndex) expect(stars).toContain(e.repo);
    for (const c of caseStudies) expect(stars).toContain(c.id);
  });

  it("ranks the literal entity first", () => {
    expect(search("paged kv cache")[0].doc.star).toMatch(/kv-cache/);
    expect(search("renaissance ocr")[0].doc.star).toBe("renaissance-ocr");
  });
});

describe("starRelevance", () => {
  it("is empty for short or unmatched input", () => {
    expect(starRelevance("hi").size).toBe(0);
    expect(starRelevance("zzzz qqqq").size).toBe(0);
  });
  it("scores 0..1 with the best star at 1", () => {
    const r = starRelevance("whisper speech recognition");
    expect(Math.max(...r.values())).toBe(1);
    for (const v of r.values()) expect(v).toBeGreaterThan(0);
  });
});

describe("detectAbsence", () => {
  it("names what is not on record, with neighbours", () => {
    const a = detectAbsence("Does he know Kubernetes?");
    expect(a?.missing).toEqual(["Kubernetes"]);
    expect(a?.closest.length).toBeGreaterThan(0);
  });
  it("separates present from missing", () => {
    const a = detectAbsence("Has he used Terraform and Docker?");
    expect(a?.missing).toEqual(["Terraform"]);
    expect(a?.present).toEqual(["Docker"]);
  });
  it("stays quiet for things on record and for non-skill questions", () => {
    expect(detectAbsence("Is he good at Python?")).toBeNull();
    expect(detectAbsence("How do I contact him?")).toBeNull();
    expect(detectAbsence("What did he do at WorldQuant?")).toBeNull();
  });
});
