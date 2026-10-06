import { describe, expect, it } from "vitest";
import { POST as mcp } from "@/app/api/mcp/route";
import { GET as llms } from "@/app/llms.txt/route";
import { GET as dossier } from "@/app/dossier.json/route";
import sitemap from "@/app/sitemap";
import { caseStudies, counts } from "@/data/portfolio";

const rpc = async (body: unknown) =>
  mcp(new Request("http://local/api/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

describe("MCP endpoint", () => {
  it("bounds batches and request size on the public endpoint", async () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ jsonrpc: "2.0", id: i, method: "tools/list" }));
    expect((await rpc(many)).status).toBe(400);
    const huge = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "search_dossier", arguments: { query: "x".repeat(40_000) } } };
    expect((await rpc(huge)).status).toBe(413);
  });

  it("initializes, negotiating the protocol version", async () => {
    const res = await (await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } })).json();
    expect(res.result.protocolVersion).toBe("2025-06-18");
    expect(res.result.capabilities.tools).toBeDefined();
  });

  it("accepts notifications with 202 and no body", async () => {
    const res = await rpc({ jsonrpc: "2.0", method: "notifications/initialized" });
    expect(res.status).toBe(202);
  });

  it("lists tools and calls them", async () => {
    const list = await (await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" })).json();
    expect(list.result.tools.map((t: { name: string }) => t.name)).toContain("match_requirements");

    const call = await (
      await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search_dossier", arguments: { query: "paged kv cache" } } })
    ).json();
    expect(call.result.structuredContent.results[0].name).toMatch(/KV/i);

    const fit = await (
      await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "match_requirements", arguments: { text: "- PyTorch\n- Kubernetes" } } })
    ).json();
    expect(fit.result.structuredContent.summary).toMatchObject({ total: 2, gap: 1 });
  });

  it("answers batches and reports unknown methods", async () => {
    const res = await (await rpc([{ jsonrpc: "2.0", id: 5, method: "ping" }, { jsonrpc: "2.0", id: 6, method: "nope" }])).json();
    expect(res).toHaveLength(2);
    expect(res[1].error.code).toBe(-32601);
  });
});

describe("llms.txt, dossier.json, sitemap", () => {
  it("llms.txt briefs a model in one fetch", async () => {
    const t = await llms().text();
    expect(t).toMatch(/^# Divanshu Sharma/);
    for (const h of ["## Contact", "## Experience", "## Selected work", "## Open source", "## Machine-readable"]) expect(t).toContain(h);
    expect(t).toContain("/api/mcp");
  });

  it("dossier.json carries the whole typed record", async () => {
    const d = await dossier().json();
    expect(d.schema).toBe("div1.dossier/1");
    expect(d.caseStudies).toHaveLength(counts.caseStudies);
    expect(d.fromScratchIndex).toHaveLength(counts.systems);
  });

  it("sitemap lists every page and figure", () => {
    const urls = sitemap().map((u) => u.url);
    for (const c of caseStudies) expect(urls.some((u) => u.endsWith(`/work/${c.id}`))).toBe(true);
    expect(urls.some((u) => u.endsWith("/cv"))).toBe(true);
  });
});
