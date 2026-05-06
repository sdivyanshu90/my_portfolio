import { createOpenAI } from "@ai-sdk/openai";
import { getConfig } from "@/lib/config-loader";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";

import { SYSTEM_PROMPT } from "./prompt";
import { getContact } from "./tools/getContact";
import { getInternship } from "./tools/getIntership";
import { getPresentation } from "./tools/getPresentation";
import { getProjects } from "./tools/getProjects";
import { getResume } from "./tools/getResume";
import { getSkills } from "./tools/getSkills";

export const maxDuration = 30;

const MAX_MESSAGE_COUNT = 16;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_TOTAL_CHARACTERS = 12_000;
const MAX_BODY_BYTES = 60_000;
const MAX_LINKS_PER_MESSAGE = 4;
const MAX_CODE_FENCE_COUNT = 4;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_CONCURRENT_REQUESTS_PER_IP = 2;

const ZERO_ARG_TOOL_NAMES = new Set([
  "getProjects",
  "getPresentation",
  "getResume",
  "getContact",
  "getSkills",
  "getInternship",
]);

const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

const config = getConfig();

const defaultAllowedOrigins = [
  config.meta.siteUrl,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]
  .filter((value): value is string => Boolean(value))
  .flatMap((value) => {
    try {
      return [new URL(value).origin];
    } catch {
      return [];
    }
  });

const chatRequestSchema = z.object({
  messages: z
    .array(
      z
        .object({
          role: z.string(),
          content: z.unknown().optional(),
          experimental_attachments: z.array(z.unknown()).optional(),
        })
        .passthrough(),
    )
    .min(1)
    .max(MAX_MESSAGE_COUNT),
});

const suspiciousPatterns: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern:
      /(ignore|disregard|bypass).{0,40}(previous|system|above|instruction)/i,
    reason: "prompt-injection",
  },
  {
    pattern:
      /(reveal|show|print|dump).{0,40}(system prompt|hidden prompt|api key|token|secret|environment variable)/i,
    reason: "secret-exfiltration",
  },
  {
    pattern:
      /(developer message|hidden policy|tool schema|internal chain of thought|prompt leak)/i,
    reason: "instruction-exfiltration",
  },
  {
    pattern: /<script\b|javascript:|onerror=|onload=|iframe|document\.cookie/i,
    reason: "script-injection",
  },
  {
    pattern:
      /(\.\.\/|\/etc\/passwd|cmd\.exe|powershell|subprocess|child_process|rm -rf|drop table|union select)/i,
    reason: "command-or-injection-attempt",
  },
  {
    pattern:
      /(base64|decode this|rot13|hex dump|serialize the prompt|raw json schema)/i,
    reason: "encoded-exfiltration-attempt",
  },
];

const SIMPLE_ALLOWED_CHAT_PATTERN =
  /^(hi|hello|hey|good (morning|afternoon|evening)|thanks|thank you|ok|okay|cool|continue|go on|what can you do\??|help\??)$/i;
const DIRECT_IN_SCOPE_PATTERN =
  /\b(tell me about yourself|introduce yourself|who are you|walk me through your resume|can i see your resume|why should (i|we) hire you|why reject you|top\s+\d+\s+reasons?\s+to\s+(hire|reject)\s+you|what are your skills|what are your projects|tell me about your yale university research|tell me about yale university research|which github repositories matter most|what open source work are you proud of|how can i reach you)\b/i;
const CANDIDATE_ANCHOR_PATTERN =
  /\b(you|your|yourself|divanshu|candidate|applicant|portfolio|resume|cv|profile)\b/i;
const PORTFOLIO_TOPIC_PATTERN =
  /\b(experience|research|projects?|skills?|education|certifications?|availability|contact|email|phone|linkedin|github|repositories?|repos?|portfolio|background|strengths?|weaknesses?|hire|reject|fit|salary|motivation|goals?|work style|achievements?|internship|full[- ]?time|open[- ]?source|intro|introduction|bio|summary|career|role|roles?)\b/i;
const PORTFOLIO_TRANSFORM_PATTERN =
  /\b(rewrite|rephrase|format|bullet|table|summarize|summary|condense|shorten|expand|tailor|draft|email|pitch|headline|cover letter|compare|rank|list|refine)\b/i;
const FOLLOW_UP_SCOPE_PATTERN =
  /\b(that|this|it|those|them|point\s+\d+|section\s+\d+|earlier|previous|above)\b|\b(rewrite|rephrase|format|bullet|table|summarize|summary|condense|shorten|expand|tailor|compare|rank|list|make it|refine)\b/i;

const encodedBlobPattern = /(?:^|[\s"'`])[A-Za-z0-9+/]{80,}={0,2}(?:$|[\s"'`])/;
const bidiControlPattern = /[\u202A-\u202E\u2066-\u2069]/;
const excessiveRepeatPattern = /(.)\1{24,}/;

const portfolioEntityPhrases = [
  config.personal.name,
  config.personal.handle,
  config.education.completed1.institution,
  ...config.experience.map((experience) => experience.company),
  ...config.experience.map((experience) => experience.position),
  ...config.projects.map((project) => project.title),
]
  .map((value) => normalizeScopeText(value))
  .filter(Boolean);

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __portfolioChatRateLimit?: Map<string, RateLimitEntry>;
  __portfolioChatPendingRequests?: Map<string, number>;
};

const rateLimitStore =
  globalForRateLimit.__portfolioChatRateLimit ??
  (globalForRateLimit.__portfolioChatRateLimit = new Map<
    string,
    RateLimitEntry
  >());

const pendingRequestStore =
  globalForRateLimit.__portfolioChatPendingRequests ??
  (globalForRateLimit.__portfolioChatPendingRequests = new Map<
    string,
    number
  >());

type NormalizedMessage = {
  role: "user" | "assistant";
  content: string;
};

function normalizeScopeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPortfolioEntity(normalizedMessage: string) {
  return portfolioEntityPhrases.some(
    (phrase) => phrase.length > 0 && normalizedMessage.includes(phrase),
  );
}

function isDirectlyInScopeRequest(message: string) {
  const normalizedMessage = normalizeScopeText(message);

  if (!normalizedMessage) {
    return false;
  }

  if (SIMPLE_ALLOWED_CHAT_PATTERN.test(normalizedMessage)) {
    return true;
  }

  if (DIRECT_IN_SCOPE_PATTERN.test(normalizedMessage)) {
    return true;
  }

  if (containsPortfolioEntity(normalizedMessage)) {
    return true;
  }

  return (
    CANDIDATE_ANCHOR_PATTERN.test(normalizedMessage) &&
    (PORTFOLIO_TOPIC_PATTERN.test(normalizedMessage) ||
      PORTFOLIO_TRANSFORM_PATTERN.test(normalizedMessage))
  );
}

function isScopedFollowUpRequest(
  latestMessage: string,
  previousUserMessages: string[],
) {
  const normalizedMessage = normalizeScopeText(latestMessage);

  if (!normalizedMessage || !FOLLOW_UP_SCOPE_PATTERN.test(normalizedMessage)) {
    return false;
  }

  return previousUserMessages
    .slice(-3)
    .some((message) => isDirectlyInScopeRequest(message));
}

function assertPortfolioScope(messages: NormalizedMessage[]) {
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content);
  const latestUserMessage = userMessages.at(-1) ?? "";
  const previousUserMessages = userMessages.slice(0, -1);

  if (
    isDirectlyInScopeRequest(latestUserMessage) ||
    isScopedFollowUpRequest(latestUserMessage, previousUserMessages)
  ) {
    return;
  }

  throw new Response(
    "This assistant only answers questions about Divanshu Sharma's portfolio, experience, projects, resume, hiring fit, and related recruiter prompts. It will not solve unrelated coding, math, or general-knowledge tasks. Ask about his background, research, skills, education, certifications, availability, or contact details instead.",
    { status: 400 },
  );
}

function getStreamErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }

    if (process.env.NODE_ENV !== "production") {
      try {
        return JSON.stringify(error);
      } catch {
        return String(error);
      }
    }

    return "An error occurred.";
  }

  if (
    /request too large for model|rate limit|quota|tokens per minute/i.test(
      error.message,
    )
  ) {
    return "OpenRouter free-model request budget exceeded. Ask a narrower question or start a new chat.";
  }

  if (process.env.NODE_ENV !== "production") {
    return error.message;
  }

  return "An error occurred.";
}

function isLoopbackOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (host) {
    const proto =
      forwardedProto ?? new URL(request.url).protocol.replace(":", "");
    return `${proto}://${host}`;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

function isAllowedOriginValue(
  origin: string,
  requestOrigin: string | null,
  allowedOrigins: Set<string>,
) {
  if (allowedOrigins.has(origin)) {
    return true;
  }

  if (requestOrigin && origin === requestOrigin) {
    return true;
  }

  return process.env.NODE_ENV !== "production" && isLoopbackOrigin(origin);
}

function extractIp(request: Request) {
  const connectingIp = request.headers.get("cf-connecting-ip")?.trim();
  if (connectingIp) {
    return connectingIp;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const origin = request.headers.get("origin");
  if (origin && isLoopbackOrigin(origin)) {
    return `dev-origin:${origin}`;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (isLoopbackOrigin(refererOrigin)) {
        return `dev-origin:${refererOrigin}`;
      }
    } catch {
      // Fall back to the host-based key below.
    }
  }

  return request.headers.get("host")?.trim() || "unknown";
}

function assertJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Response("Chat endpoint only accepts JSON requests.", {
      status: 415,
    });
  }

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new Response("Request body is too large.", { status: 413 });
  }
}

function getAllowedOrigins() {
  const configuredOrigins = process.env.ALLOWED_CHAT_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .flatMap((origin) => {
      try {
        return [new URL(origin).origin];
      } catch {
        return [];
      }
    });

  return new Set(
    configuredOrigins && configuredOrigins.length > 0
      ? configuredOrigins
      : defaultAllowedOrigins,
  );
}

function assertAllowedOrigin(request: Request) {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = getRequestOrigin(request);

  const origin = request.headers.get("origin");
  if (origin && !isAllowedOriginValue(origin, requestOrigin, allowedOrigins)) {
    throw new Response("Origin not allowed.", { status: 403 });
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return;
  }

  let refererOrigin: string;

  try {
    refererOrigin = new URL(referer).origin;
  } catch {
    throw new Response("Invalid referer.", { status: 403 });
  }

  if (!isAllowedOriginValue(refererOrigin, requestOrigin, allowedOrigins)) {
    throw new Response("Referer not allowed.", { status: 403 });
  }
}

function cleanupRateLimitStore(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function assertRateLimit(ip: string) {
  const now = Date.now();
  cleanupRateLimitStore(now);

  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Response("Too many requests. Please try again in a minute.", {
      status: 429,
    });
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
}

function assertConcurrentLimit(ip: string) {
  const currentCount = pendingRequestStore.get(ip) ?? 0;

  if (currentCount >= MAX_CONCURRENT_REQUESTS_PER_IP) {
    throw new Response(
      "Too many in-flight requests. Please wait for the current reply to finish.",
      { status: 429 },
    );
  }

  pendingRequestStore.set(ip, currentCount + 1);
}

function releaseConcurrentLimit(ip: string) {
  const currentCount = pendingRequestStore.get(ip);

  if (!currentCount) {
    return;
  }

  if (currentCount <= 1) {
    pendingRequestStore.delete(ip);
    return;
  }

  pendingRequestStore.set(ip, currentCount - 1);
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return "";
      })
      .join(" ");
  }

  return "";
}

function normalizeIncomingMessages(
  messages: z.infer<typeof chatRequestSchema>["messages"],
): NormalizedMessage[] {
  if (messages[messages.length - 1]?.role !== "user") {
    throw new Response("The final message must come from the user.", {
      status: 400,
    });
  }

  const filteredMessages = messages
    .filter(
      (
        message,
      ): message is {
        role: "user" | "assistant";
        content?: unknown;
        experimental_attachments?: unknown[];
      } => message.role === "user" || message.role === "assistant",
    )
    .slice(-MAX_MESSAGE_COUNT)
    .map((message) => {
      if (message.experimental_attachments?.length) {
        throw new Response("Attachments are not accepted on this endpoint.", {
          status: 400,
        });
      }

      const normalizedContent = extractTextContent(message.content)
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .replace(/\s{3,}/g, "  ")
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH);

      return {
        role: message.role,
        content: normalizedContent,
      };
    })
    .filter((message) => message.content.length > 0);

  const totalCharacters = filteredMessages.reduce(
    (sum, message) => sum + message.content.length,
    0,
  );

  if (filteredMessages.length === 0) {
    throw new Response("At least one valid message is required.", {
      status: 400,
    });
  }

  if (totalCharacters > MAX_TOTAL_CHARACTERS) {
    throw new Response("Conversation is too large. Please start a new chat.", {
      status: 413,
    });
  }

  for (const message of filteredMessages) {
    if (message.role === "user") {
      assertNoSuspiciousPayload(message.content);
    }
  }

  return filteredMessages;
}

function assertNoSuspiciousPayload(message: string) {
  const normalized = message.trim();

  if (!normalized) {
    throw new Response("Empty messages are not allowed.", { status: 400 });
  }

  if ((normalized.match(/https?:\/\//g) ?? []).length > MAX_LINKS_PER_MESSAGE) {
    throw new Response("Too many links in a single message.", { status: 400 });
  }

  if ((normalized.match(/```/g) ?? []).length > MAX_CODE_FENCE_COUNT) {
    throw new Response(
      "Large code payloads are blocked on this endpoint. Ask a concise portfolio question instead.",
      { status: 400 },
    );
  }

  if (encodedBlobPattern.test(normalized)) {
    throw new Response("Encoded payloads are blocked on this endpoint.", {
      status: 400,
    });
  }

  if (
    bidiControlPattern.test(normalized) ||
    excessiveRepeatPattern.test(normalized)
  ) {
    throw new Response("Malformed or obfuscated input was blocked.", {
      status: 400,
    });
  }

  for (const rule of suspiciousPatterns) {
    if (rule.pattern.test(normalized)) {
      throw new Response(
        `Request blocked by security guardrails (${rule.reason}). Ask about Divanshu's experience, projects, skills, education, certifications, or contact details instead.`,
        { status: 400 },
      );
    }
  }
}

async function repairPortfolioToolCall({
  toolCall,
}: {
  toolCall: {
    toolCallType: "function";
    toolName: string;
    args: string;
    toolCallId: string;
  };
  error: unknown;
}) {
  if (!ZERO_ARG_TOOL_NAMES.has(toolCall.toolName)) {
    return null;
  }

  const normalizedArgs = toolCall.args.trim();

  if (normalizedArgs === "{}") {
    return null;
  }

  return {
    ...toolCall,
    args: "{}",
  };
}

export async function POST(req: Request) {
  const ip = extractIp(req);

  try {
    assertJsonRequest(req);
    assertAllowedOrigin(req);
    assertRateLimit(ip);
    assertConcurrentLimit(ip);

    const payload = chatRequestSchema.parse(await req.json());
    const messages = normalizeIncomingMessages(payload.messages);
    assertPortfolioScope(messages);

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("Missing OpenRouter API key.", { status: 500 });
    }

    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": config.meta.siteUrl,
        "X-Title": `${config.personal.name} Portfolio`,
      },
    });

    const openrouterModel =
      process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;

    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getInternship,
    };

    const coreMessages = convertToCoreMessages(messages, { tools });

    const result = await streamText({
      model: openrouter(
        openrouterModel.endsWith(":free")
          ? openrouterModel
          : `${openrouterModel}:free`,
      ),
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      tools,
      experimental_repairToolCall: repairPortfolioToolCall,
      temperature: 0.2,
      maxSteps: 2,
    });

    const response = result.toDataStreamResponse({
      getErrorMessage: getStreamErrorMessage,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    );

    return response;
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (error instanceof z.ZodError) {
      return new Response("Invalid chat payload.", { status: 400 });
    }

    if (
      error instanceof Error &&
      /(quota|rate limit|429)/i.test(error.message ?? "")
    ) {
      return new Response(
        "OpenRouter free-model quota exceeded. Please try again later.",
        {
          status: 429,
        },
      );
    }

    if (error instanceof Error && error.message?.includes("network")) {
      return new Response(
        "Network error. Please check your connection and try again.",
        { status: 503 },
      );
    }

    console.error("Chat API error:", error);
    return new Response("Internal server error.", { status: 500 });
  } finally {
    releaseConcurrentLimit(ip);
  }
}
