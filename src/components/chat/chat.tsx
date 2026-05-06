"use client";

import ChatBottombar from "@/components/chat/chat-bottombar";
import ChatLanding from "@/components/chat/chat-landing";
import ChatMessageContent from "@/components/chat/chat-message-content";
import { PresetReply } from "@/components/chat/preset-reply";
import { SimplifiedChatView } from "@/components/chat/simple-chat-view";
import { getConfig, presetReplies } from "@/lib/config-loader";
import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Github,
  Linkedin,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import HelperBoost from "./HelperBoost";

interface PresetReplyState {
  question: string;
  reply: string;
  tool: string;
}

const portfolioConfig = getConfig();

const featuredProjects = portfolioConfig.projects.filter(
  (project) => project.featured,
);
const profileStats = [
  {
    label: "Projects",
    value: String(portfolioConfig.projects.length).padStart(2, "0"),
  },
  {
    label: "Core Focus",
    value: "AI x Systems",
  },
  {
    label: "Availability",
    value: "Immediate",
  },
];

const directLinks = [
  {
    label: "Email",
    href: `mailto:${portfolioConfig.personal.email}`,
    icon: Mail,
  },
  {
    label: "GitHub",
    href: portfolioConfig.social.github,
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: portfolioConfig.social.linkedin,
    icon: Linkedin,
  },
].filter((link) => Boolean(link.href));

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: easeOut,
  },
};

const MAX_REQUEST_MESSAGES = 8;
const MAX_REQUEST_MESSAGE_LENGTH = 1_200;

function extractMessageText(message: UIMessage) {
  if (typeof message.content === "string" && message.content.trim()) {
    return message.content.trim();
  }

  if (!Array.isArray(message.parts)) {
    return "";
  }

  return message.parts
    .flatMap((part) => {
      if (part.type === "text" && typeof part.text === "string") {
        return [part.text];
      }

      return [];
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildRequestMessages(messages: UIMessage[]) {
  return messages
    .slice(-MAX_REQUEST_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: extractMessageText(message).slice(0, MAX_REQUEST_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0);
}

function Avatar() {
  return (
    <Link
      href="/"
      className="relative block h-24 w-24 overflow-hidden rounded-[28px]"
    >
      <Image
        src="/avatar.png"
        alt="Divanshu Sharma avatar"
        fill
        sizes="96px"
        priority
        className="object-cover object-[center_top_-5%] scale-95"
      />
    </Link>
  );
}

const Chat = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query");
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [presetReply, setPresetReply] = useState<PresetReplyState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    stop,
    setInput,
    reload,
    addToolResult,
    append,
  } = useChat({
    experimental_prepareRequestBody: ({
      id,
      messages,
      requestData,
      requestBody,
    }) => ({
      ...(requestBody && typeof requestBody === "object" ? requestBody : {}),
      id,
      data: requestData,
      messages: buildRequestMessages(messages),
    }),
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onFinish: () => {
      setLoadingSubmit(false);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      console.error("Chat error:", error.message, error.cause);

      const normalizedMessage = error.message?.toLowerCase() ?? "";

      if (
        normalizedMessage.includes("too many requests") ||
        normalizedMessage.includes("in-flight requests")
      ) {
        toast.error(
          "The local chat guardrail is throttling requests. Wait a minute and retry.",
          {
            duration: 5000,
            style: {
              background: "#fff4df",
              border: "1px solid #f1b969",
              color: "#8a4b09",
              fontSize: "14px",
              fontWeight: "500",
            },
          },
        );
        setErrorMessage("local_rate_limit");
      } else if (
        normalizedMessage.includes("origin not allowed") ||
        normalizedMessage.includes("referer not allowed")
      ) {
        toast.error(
          "This local app origin is blocked by the chat API guardrails.",
          {
            duration: 5000,
          },
        );
        setErrorMessage("origin_not_allowed");
      } else if (
        normalizedMessage.includes("request body is too large") ||
        normalizedMessage.includes("conversation is too large")
      ) {
        toast.error(
          "The current conversation is too large. Recent history is now trimmed automatically, but starting a new chat may still help.",
          {
            duration: 6000,
            style: {
              background: "#fff4df",
              border: "1px solid #f1b969",
              color: "#8a4b09",
              fontSize: "14px",
              fontWeight: "500",
            },
          },
        );
        setErrorMessage("conversation_too_large");
      } else if (
        normalizedMessage.includes(
          "this assistant only answers questions about divanshu sharma s portfolio",
        ) ||
        normalizedMessage.includes("related recruiter prompts")
      ) {
        toast.error(
          "This assistant is intentionally limited to Divanshu's portfolio, experience, projects, and recruiter-facing questions.",
          {
            duration: 6000,
            style: {
              background: "#fff4df",
              border: "1px solid #f1b969",
              color: "#8a4b09",
              fontSize: "14px",
              fontWeight: "500",
            },
          },
        );
        setErrorMessage("out_of_scope");
      } else if (
        normalizedMessage.includes("quota") ||
        normalizedMessage.includes("exceeded") ||
        normalizedMessage.includes("429")
      ) {
        toast.error(
          "The OpenRouter free model is rate-limited right now. Use the preset cards or contact Divanshu directly.",
          {
            duration: 6000,
            style: {
              background: "#fff4df",
              border: "1px solid #f1b969",
              color: "#8a4b09",
              fontSize: "14px",
              fontWeight: "500",
            },
          },
        );
        setErrorMessage("quota_exhausted");
      } else if (error.message?.includes("network")) {
        toast.error(
          "Network error. Please check your connection and try again.",
        );
        setErrorMessage(
          "Network error. Please check your connection and try again.",
        );
      } else {
        toast.error(`Error: ${error.message}`);
        setErrorMessage(`Error: ${error.message}`);
      }
    },
  });

  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(
      (message) => message.role === "assistant",
    );
    const latestUserMessageIndex = messages.findLastIndex(
      (message) => message.role === "user",
    );

    const result = {
      currentAIMessage:
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null,
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (part) =>
            part.type === "tool-invocation" &&
            part.toolInvocation?.state === "result",
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (message) =>
      message.role === "assistant" &&
      message.parts?.some(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation?.state !== "result",
      ),
  );

  const submitQuery = useCallback(
    (query: string) => {
      if (!query.trim() || isToolInProgress) return;

      setErrorMessage(null);

      if (presetReplies[query]) {
        const preset = presetReplies[query];
        setPresetReply({
          question: query,
          reply: preset.reply,
          tool: preset.tool,
        });
        setLoadingSubmit(false);
        return;
      }

      setLoadingSubmit(true);
      setPresetReply(null);
      void append({
        role: "user",
        content: query,
      });
    },
    [append, isToolInProgress],
  );

  const submitQueryToAI = useCallback(
    (query: string) => {
      if (!query.trim() || isToolInProgress) return;

      setErrorMessage(null);
      setLoadingSubmit(true);
      setPresetReply(null);
      void append({
        role: "user",
        content: query,
      });
    },
    [append, isToolInProgress],
  );

  const handlePresetReply = useCallback(
    (question: string, reply: string, tool: string) => {
      setPresetReply({ question, reply, tool });
      setLoadingSubmit(false);
    },
    [],
  );

  const handleGetAIResponse = useCallback(
    (question: string) => {
      setPresetReply(null);
      submitQueryToAI(question);
    },
    [submitQueryToAI],
  );

  useEffect(() => {
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput("");
      submitQuery(initialQuery);
    }
  }, [autoSubmitted, initialQuery, setInput, submitQuery]);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!input.trim() || isToolInProgress) return;
      submitQueryToAI(input);
      setInput("");
    },
    [input, isToolInProgress, setInput, submitQueryToAI],
  );

  const handleStop = useCallback(() => {
    stop();
    setLoadingSubmit(false);
  }, [stop]);

  const isEmptyState =
    !currentAIMessage &&
    !latestUserMessage &&
    !loadingSubmit &&
    !presetReply &&
    !errorMessage;

  const errorCardCopy = useMemo(() => {
    if (errorMessage === "quota_exhausted") {
      return {
        kicker: "Provider Limit",
        title: "The OpenRouter free model is exhausted for now.",
        description:
          "The app is running on a free OpenRouter model. When the provider quota is spent, the fastest fallback is to use the preset portfolio cards or reach out directly.",
        bullets: [
          "Use preset replies for projects, resume, skills, or contact details.",
          "Reach out directly for a live walkthrough or resume exchange.",
          "Retry later when the provider quota resets.",
        ],
      };
    }

    if (errorMessage === "local_rate_limit") {
      return {
        kicker: "Rate Limit",
        title: "The local chat guardrail is throttling requests.",
        description:
          "This limit comes from the app itself, not from OpenRouter. It usually clears quickly after bursty retries or overlapping requests.",
        bullets: [
          "Wait about a minute, then retry a single question.",
          "Avoid submitting multiple prompts before the current reply finishes.",
          "Use the preset cards if you need portfolio details immediately.",
        ],
      };
    }

    if (errorMessage === "conversation_too_large") {
      return {
        kicker: "Conversation Size",
        title: "The chat payload became too large.",
        description:
          "Recent history is now trimmed before each request, but this conversation may still contain too much accumulated context.",
        bullets: [
          "Retry the question once now that request trimming is enabled.",
          "Start a new chat if the same error returns.",
          "Use preset cards for structured portfolio data when possible.",
        ],
      };
    }

    if (errorMessage === "out_of_scope") {
      return {
        kicker: "Scope Boundary",
        title: "This assistant stays inside Divanshu's portfolio domain.",
        description:
          "The guardrails allow recruiter-facing questions about Divanshu's background, work, projects, resume, research, skills, and hiring fit, but block unrelated general coding and knowledge tasks.",
        bullets: [
          "Ask about Divanshu's experience, projects, research, education, certifications, or contact details.",
          "Ask hiring-style questions like strengths, weaknesses, reasons to hire, or role fit.",
          "Use a new tool or a different assistant for unrelated coding problems or general tutoring.",
        ],
      };
    }

    if (errorMessage === "origin_not_allowed") {
      return {
        kicker: "Origin Check",
        title: "This local app origin was blocked.",
        description:
          "The browser request did not match the chat API origin allowlist. Refreshing after the route update should clear it.",
        bullets: [
          "Reload the current app tab and retry the question.",
          "Make sure the app is opened from the same local host and port as the API route.",
          "Use preset replies if you only need portfolio data while the local route is unavailable.",
        ],
      };
    }

    return {
      kicker: "Chat Error",
      title: "The assistant request failed.",
      description:
        errorMessage ?? "Something went wrong while requesting the assistant.",
      bullets: [
        "Retry the question once.",
        "Use preset replies if you need structured portfolio details immediately.",
        "Reach out directly if the issue persists.",
      ],
    };
  }, [errorMessage]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-[-6%] h-72 w-72 rounded-full bg-[#8ff1e3]/30 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-80 w-80 rounded-full bg-[#ffd8b4]/60 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] h-72 w-72 rounded-full bg-[#c7d2fe]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid min-w-0 flex-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="panel-surface flex min-w-0 flex-col gap-6 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <Avatar />
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e1e9] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#556173]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                </span>
                Open to strong teams
              </div>
            </div>

            <div className="min-w-0 space-y-4">
              <p className="section-kicker">Candidate Snapshot</p>
              <div className="min-w-0">
                <h1 className="font-display text-safe-balance text-3xl font-semibold tracking-tight text-[#102133] sm:text-[2.35rem]">
                  {portfolioConfig.personal.name}
                </h1>
                <p className="text-safe-wrap mt-2 text-base font-medium text-[#0b544b]">
                  {portfolioConfig.personal.title}
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2 text-sm text-[#5c6675]">
                <MapPin className="h-4 w-4 text-[#0b544b]" />
                <span className="text-safe-wrap">
                  {portfolioConfig.personal.location}
                </span>
              </div>
              <p className="text-safe-wrap text-sm leading-7 text-[#556173]">
                {portfolioConfig.personal.bio}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
              {profileStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-[#d8e1e9] bg-white/78 p-4 shadow-sm"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#7b8797]">
                    {stat.label}
                  </p>
                  <p className="text-safe-wrap mt-3 font-display text-xl font-semibold text-[#102133]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="section-kicker">Direct Links</p>
              <div className="flex flex-wrap gap-2.5">
                {directLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[#d8e1e9] bg-white/84 px-4 py-2 text-sm font-medium text-[#233044] transition hover:-translate-y-0.5 hover:bg-white"
                    >
                      <Icon className="h-4 w-4 text-[#0b544b]" />
                      <span className="text-safe-wrap">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="section-kicker">Current Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {portfolioConfig.internship.focusAreas
                  .slice(0, 5)
                  .map((area) => (
                    <span
                      key={area}
                      className="text-safe-wrap rounded-full border border-[#cfe0d9] bg-[#eef6f3] px-3 py-1.5 text-sm text-[#0b544b]"
                    >
                      {area}
                    </span>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="section-kicker">Featured Builds</p>
              <div className="space-y-3">
                {featuredProjects.slice(0, 3).map((project) => (
                  <button
                    key={project.title}
                    onClick={() =>
                      submitQuery(`Tell me about ${project.title}.`)
                    }
                    className="w-full min-w-0 rounded-[24px] border border-[#d8e1e9] bg-white/84 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <p className="text-safe-wrap text-sm font-semibold text-[#102133]">
                      {project.title}
                    </p>
                    <p className="text-safe-wrap mt-1 text-xs uppercase tracking-[0.2em] text-[#7b8797]">
                      {project.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="panel-surface flex min-h-[72vh] min-w-0 flex-col overflow-hidden">
            <header className="border-b border-black/5 px-5 py-5 sm:px-6">
              <div className="flex min-w-0 flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                <div className="max-w-3xl min-w-0 space-y-2">
                  <p className="section-kicker">Interview Console</p>
                  <h2 className="font-display text-safe-balance text-3xl font-semibold tracking-tight text-[#102133] sm:text-4xl">
                    A recruiter-facing portfolio assistant with grounded
                    answers.
                  </h2>
                  <p className="text-safe-wrap text-sm leading-7 text-[#556173] sm:text-base">
                    Ask about projects, research, product execution, system
                    design, or availability. The assistant stays scoped to real
                    portfolio data and uses tool-rendered cards when a
                    structured answer is better than plain text.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#d8e1e9] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#556173]">
                    <Bot className="h-3.5 w-3.5 text-[#0b544b]" />
                    {hasActiveTool
                      ? "Tool-grounded reply"
                      : "OpenRouter-powered chat"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#d8e1e9] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#556173]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0b544b]" />
                    Strong guardrails active
                  </span>
                </div>
              </div>
            </header>

            <div className="grid min-h-0 min-w-0 flex-1 2xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex min-h-0 min-w-0 flex-col">
                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    {isEmptyState ? (
                      <motion.div key="landing" {...MOTION_CONFIG}>
                        <ChatLanding
                          submitQuery={submitQuery}
                          handlePresetReply={handlePresetReply}
                        />
                      </motion.div>
                    ) : presetReply ? (
                      <motion.div key="preset" {...MOTION_CONFIG}>
                        <PresetReply
                          question={presetReply.question}
                          reply={presetReply.reply}
                          tool={presetReply.tool}
                          onGetAIResponse={handleGetAIResponse}
                          onClose={() => setPresetReply(null)}
                        />
                      </motion.div>
                    ) : errorMessage ? (
                      <motion.div key="error" {...MOTION_CONFIG}>
                        <div className="panel-surface min-w-0 border border-[#f1d1a4] bg-[#fff4df] p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4b45f] text-white">
                              <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 space-y-4">
                              <div>
                                <p className="section-kicker text-[#8a4b09]">
                                  {errorCardCopy.kicker}
                                </p>
                                <h3 className="font-display text-safe-balance mt-2 text-2xl font-semibold text-[#8a4b09]">
                                  {errorCardCopy.title}
                                </h3>
                              </div>

                              <div className="space-y-3 text-sm leading-7 text-[#9b5a11]">
                                <p className="text-safe-wrap">
                                  {errorCardCopy.description}
                                </p>
                                <ul className="list-disc space-y-1 pl-5">
                                  {errorCardCopy.bullets.map((bullet) => (
                                    <li key={bullet} className="text-safe-wrap">
                                      {bullet}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={() => {
                                    setErrorMessage(null);
                                    const preset =
                                      presetReplies["How can I reach you?"];
                                    if (preset) {
                                      setPresetReply({
                                        question: "How can I reach you?",
                                        reply: preset.reply,
                                        tool: preset.tool,
                                      });
                                    }
                                  }}
                                  className="rounded-full bg-[#8a4b09] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#713d06]"
                                >
                                  Show contact card
                                </button>
                                <button
                                  onClick={() => {
                                    setErrorMessage(null);
                                    router.push("/");
                                  }}
                                  className="rounded-full border border-[#e8c89f] bg-white/70 px-4 py-2 text-sm font-medium text-[#8a4b09] transition hover:bg-white"
                                >
                                  Back to presets
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="conversation"
                        {...MOTION_CONFIG}
                        className="space-y-4"
                      >
                        {latestUserMessage ? (
                          <div className="flex justify-end">
                            <ChatBubble variant="sent" className="max-w-2xl">
                              <ChatBubbleMessage>
                                <ChatMessageContent
                                  message={latestUserMessage}
                                  isLast={true}
                                  isLoading={false}
                                  reload={() => Promise.resolve(null)}
                                />
                              </ChatBubbleMessage>
                            </ChatBubble>
                          </div>
                        ) : null}

                        {currentAIMessage ? (
                          <SimplifiedChatView
                            message={currentAIMessage}
                            isLoading={isLoading}
                            reload={reload}
                            addToolResult={addToolResult}
                          />
                        ) : (
                          loadingSubmit && (
                            <ChatBubble variant="received">
                              <ChatBubbleMessage isLoading />
                            </ChatBubble>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-black/5 bg-white/55 px-4 py-4 backdrop-blur-xl sm:px-6">
                  <div className="space-y-4">
                    <HelperBoost
                      submitQuery={submitQuery}
                      handlePresetReply={handlePresetReply}
                    />
                    <ChatBottombar
                      input={input}
                      handleInputChange={handleInputChange}
                      handleSubmit={onSubmit}
                      isLoading={isLoading}
                      stop={handleStop}
                      isToolInProgress={isToolInProgress}
                    />
                  </div>
                </div>
              </div>

              <aside className="hidden min-w-0 border-l border-black/5 bg-[#f6f0e8]/86 p-5 2xl:flex 2xl:flex-col 2xl:justify-between">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="section-kicker">Fast Paths</p>
                    <button
                      onClick={() =>
                        submitQuery("What projects are you most proud of?")
                      }
                      className="flex w-full min-w-0 items-center justify-between rounded-[22px] border border-[#d8e1e9] bg-white/82 px-4 py-3 text-left text-sm font-medium text-[#233044] shadow-sm transition hover:-translate-y-0.5"
                    >
                      <span className="text-safe-wrap">Project highlights</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#0b544b]" />
                    </button>
                    <button
                      onClick={() => submitQuery("What are your skills?")}
                      className="flex w-full min-w-0 items-center justify-between rounded-[22px] border border-[#d8e1e9] bg-white/82 px-4 py-3 text-left text-sm font-medium text-[#233044] shadow-sm transition hover:-translate-y-0.5"
                    >
                      <span className="text-safe-wrap">Skill inventory</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#0b544b]" />
                    </button>
                    <button
                      onClick={() => submitQuery("Can I see your resume?")}
                      className="flex w-full min-w-0 items-center justify-between rounded-[22px] border border-[#d8e1e9] bg-white/82 px-4 py-3 text-left text-sm font-medium text-[#233044] shadow-sm transition hover:-translate-y-0.5"
                    >
                      <span className="text-safe-wrap">
                        Resume and experience
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#0b544b]" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="section-kicker">Why This View Works</p>
                    <div className="rounded-[24px] border border-[#d8e1e9] bg-white/82 p-4 shadow-sm">
                      <div className="flex min-w-0 gap-3 text-sm leading-6 text-[#556173]">
                        <Bot className="mt-1 h-4 w-4 shrink-0 text-[#0b544b]" />
                        <p className="text-safe-wrap">
                          Tool results render portfolio data as cards instead of
                          vague summaries.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-[#d8e1e9] bg-white/82 p-4 shadow-sm">
                      <div className="flex min-w-0 gap-3 text-sm leading-6 text-[#556173]">
                        <BriefcaseBusiness className="mt-1 h-4 w-4 shrink-0 text-[#0b544b]" />
                        <p className="text-safe-wrap">
                          Generated project covers replace the old unrelated
                          placeholder visuals.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-[#d8e1e9] bg-white/82 p-4 shadow-sm">
                      <div className="flex min-w-0 gap-3 text-sm leading-6 text-[#556173]">
                        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#0b544b]" />
                        <p className="text-safe-wrap">
                          Requests are rate-limited, origin-checked, and
                          filtered for prompt injection and exfiltration
                          patterns.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-[#d8e1e9] bg-white/84 p-5 shadow-sm">
                  <p className="section-kicker">Best Questions</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#556173]">
                    <li className="text-safe-wrap">
                      Ask for one project and its tradeoffs.
                    </li>
                    <li className="text-safe-wrap">
                      Ask how research work translated into product execution.
                    </li>
                    <li className="text-safe-wrap">
                      Ask for role fit, availability, and direct contact in one
                      pass.
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Chat;
