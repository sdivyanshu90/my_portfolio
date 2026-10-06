import {
  caseStudies,
  education,
  layers,
  openSource,
  personal,
  resume,
  scratchIndex,
  site,
  socials,
} from "@/data/portfolio";
import { fitSummary, matchRequirements, urlFor } from "@/lib/fit";
import { search } from "@/lib/retrieval";
import { getStore } from "@/lib/store";
import { type RunLog, record } from "@/lib/telemetry";
import { overLimit, visitorId } from "@/lib/visitor";

/**
 * DIV-1 over the Model Context Protocol (streamable HTTP, stateless).
 * A recruiter's AI assistant can connect to https://div90.vercel.app/api/mcp
 * and query the verified dossier directly instead of scraping a canvas.
 * Tools return dossier facts only — the same data the site renders.
 */

const SUPPORTED = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

type Json = Record<string, unknown>;
interface RpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Json;
}

const TOOLS = [
  {
    name: "search_dossier",
    description: `Search ${personal.name}'s verified dossier (projects, from-scratch systems, roles, skills, credentials, open source). Returns ranked facts with URLs.`,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to look for, e.g. 'LLM inference serving' or 'Rust'." },
        limit: { type: "number", description: "Max results (default 8, max 20)." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_case_study",
    description: "Full case study: problem, approach, measured results, stack, and where the figures come from.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", enum: caseStudies.map((c) => c.id) } },
      required: ["id"],
    },
  },
  {
    name: "list_systems",
    description: "The from-scratch index of AI-stack reimplementations, optionally filtered by layer.",
    inputSchema: {
      type: "object",
      properties: { layer: { type: "string", enum: layers } },
    },
  },
  {
    name: "match_requirements",
    description:
      "Paste a job description or requirement list. Each requirement gets supporting evidence from the dossier and a strength (strong / partial / gap). Deterministic; gaps are reported honestly.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string", description: "Job description or newline-separated requirements." } },
      required: ["text"],
    },
  },
  {
    name: "get_contact",
    description: "Availability, email, résumé, and profile links.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

function text(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
}

function callTool(name: string, args: Json) {
  switch (name) {
    case "search_dossier": {
      const q = String(args.query ?? "").slice(0, 500);
      const limit = Math.min(20, Math.max(1, Number(args.limit) || 8));
      const hits = search(q).slice(0, limit);
      return text({
        query: q,
        results: hits.map((h) => ({
          type: h.doc.id.split(":")[0],
          name: h.doc.label,
          facts: `${h.doc.strong}. ${h.doc.body}`.slice(0, 600),
          url: urlFor(h.doc),
          score: Math.round(h.score * 100) / 100,
        })),
        note: hits.length ? undefined : "Nothing on record matches — the dossier does not cover this.",
      });
    }
    case "get_case_study": {
      const c = caseStudies.find((x) => x.id === args.id);
      if (!c) return { ...text({ error: `unknown id; one of ${caseStudies.map((x) => x.id).join(", ")}` }), isError: true };
      return text({ ...c, url: `${site.url}/work/${c.id}` });
    }
    case "list_systems": {
      const layer = typeof args.layer === "string" ? args.layer : undefined;
      return text(
        scratchIndex
          .filter((e) => !layer || e.layer === layer)
          .map((e) => ({ ...e, url: `https://github.com/${e.repo}` })),
      );
    }
    case "match_requirements": {
      const rows = matchRequirements(String(args.text ?? "").slice(0, 8000));
      return text({ summary: fitSummary(rows), rows, method: "BM25 over the verified dossier; no model involved." });
    }
    case "get_contact":
      return text({
        name: personal.name,
        availability: personal.openTo,
        currentRole: personal.currentRole,
        location: personal.location,
        email: personal.email,
        resume: resume.href,
        cv: `${site.url}/cv`,
        education: `${education.degree}, ${education.school}`,
        openSource: `${site.url}/open-source`,
        links: socials.map((s) => ({ label: s.label, url: s.href })),
        mergedUpstreamPRs: openSource.filter((o) => o.role === "Contributor").reduce((n, o) => n + o.merged, 0),
      });
    default:
      return null;
  }
}

/** A tool call as logged: what the agent asked, and a summary of the answer. */
function describeCall(name: string, args: Json, out: { structuredContent?: unknown }) {
  const data = out.structuredContent as Record<string, unknown> | unknown[] | undefined;
  switch (name) {
    case "search_dossier": {
      const results = (data as { results?: { name: string }[] })?.results ?? [];
      return { question: String(args.query ?? ""), answer: results.map((r) => r.name).join(" · ") || "nothing on record" };
    }
    case "match_requirements": {
      // The JD itself is never stored — only its size and the verdict.
      const summary = (data as { summary?: Record<string, number> })?.summary;
      return {
        question: `match_requirements(${summary?.total ?? 0} requirements)`,
        answer: summary ? `${summary.strong} strong · ${summary.partial} partial · ${summary.gap} gap` : "",
      };
    }
    case "get_case_study":
      return { question: `get_case_study(${String(args.id ?? "")})`, answer: (data as { title?: string })?.title ?? "" };
    case "list_systems":
      return {
        question: `list_systems(${String(args.layer ?? "all")})`,
        answer: `${Array.isArray(data) ? data.length : 0} systems`,
      };
    default:
      return { question: `${name}()`, answer: JSON.stringify(data ?? {}).slice(0, 500) };
  }
}

type Logged = Omit<RunLog, "at" | "visitor">;

function handle(req: RpcRequest, logs: Logged[]): Json | null {
  const reply = (result: unknown) => ({ jsonrpc: "2.0", id: req.id ?? null, result });
  const fail = (code: number, message: string) => ({ jsonrpc: "2.0", id: req.id ?? null, error: { code, message } });

  if (req.id === undefined) return null; // notification — no response
  switch (req.method) {
    case "initialize": {
      const asked = String(req.params?.protocolVersion ?? "");
      return reply({
        protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "div1-dossier", title: `${personal.name} — DIV-1`, version: site.revision },
        instructions: `Verified facts about ${personal.name} (${personal.lead}; ${personal.openTo}). Everything returned comes from his dossier; if a tool reports nothing on record, the dossier does not cover it.`,
      });
    }
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call": {
      const name = String(req.params?.name ?? "");
      const args = (req.params?.arguments as Json) ?? {};
      const t0 = Date.now();
      const out = callTool(name, args);
      if (out) {
        const { question, answer } = describeCall(name, args, out);
        logs.push({
          q: question,
          mode: "mcp",
          path: "mcp",
          source: "mcp",
          kinds: [name],
          retrieved: [],
          miss: answer === "nothing on record",
          ms: Date.now() - t0,
          answer,
        });
      }
      return out ? reply(out) : fail(-32602, `Unknown tool: ${name}`);
    }
    default:
      return fail(-32601, `Method not found: ${req.method}`);
  }
}

/** Public, unauthenticated: bounded per caller, per request and per batch. */
const MCP_PER_MIN = 30;
const MAX_BODY_BYTES = 32 * 1024;
const MAX_BATCH = 10;

const rpcError = (code: number, message: string, status: number) =>
  Response.json({ jsonrpc: "2.0", id: null, error: { code, message } }, { status, headers: { "Access-Control-Allow-Origin": "*" } });

export async function POST(request: Request): Promise<Response> {
  const store = getStore();
  const visitor = await visitorId(request);
  if (await overLimit(store, "mcp", visitor, MCP_PER_MIN)) return rpcError(-32000, "Rate limited — slow down", 429);
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return rpcError(-32600, "Request too large", 413);
    body = JSON.parse(raw);
  } catch {
    return rpcError(-32700, "Parse error", 400);
  }
  const batch = Array.isArray(body);
  if (batch && (body as unknown[]).length > MAX_BATCH) return rpcError(-32600, `Batch too large (max ${MAX_BATCH})`, 400);
  const logs: Logged[] = [];
  const replies = ((batch ? body : [body]) as unknown[])
    .filter((r): r is RpcRequest => !!r && typeof r === "object" && typeof (r as RpcRequest).method === "string")
    .map((r) => handle(r, logs))
    .filter((r): r is Json => r !== null);
  // Agents' questions land in the same table as the console's (source: mcp).
  if (logs.length) {
    const at = new Date().toISOString();
    await Promise.all(logs.map((l) => record(store, { ...l, at, visitor }).catch(() => {})));
  }
  if (!replies.length) return new Response(null, { status: 202 });
  return Response.json(batch ? replies : replies[0], {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
}

/** Stateless server: no server-initiated stream. */
export function GET(): Response {
  return new Response("DIV-1 MCP endpoint — POST JSON-RPC here.", { status: 405, headers: { Allow: "POST" } });
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Mcp-Protocol-Version, Mcp-Session-Id",
    },
  });
}
