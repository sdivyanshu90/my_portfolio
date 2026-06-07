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
import { AnimatePresence, easeOut, motion, MotionConfig } from "framer-motion";
import AuroraBackground from "@/components/anim/aurora-background";
import SpotlightCursor from "@/components/anim/spotlight-cursor";
import ThemeToggle from "@/components/anim/theme-toggle";
import { Download, Github, Linkedin, Mail, RotateCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import HelperBoost from "./HelperBoost";

interface PresetReplyState {
  question: string;
  reply: string;
  tool: string;
}

const portfolioConfig = getConfig();

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

const resumeUrl = portfolioConfig.resume?.downloadUrl ?? "";

// Map a free-typed question to the closest instant preset answer. Used as a
// fallback when the free OpenRouter model is slow / rate-limited, so recruiters
// still get an instant, structured card instead of an error.
function mapQueryToPresetKey(query: string): string | null {
  const q = query.toLowerCase();
  if (/\b(resume|cv|curriculum\s*vitae)\b/.test(q)) return "Can I see your resume?";
  if (
    /\bskills?|tech\s*stack|stack|languages?|frameworks?|tools?|expert|proficient|familiar|do you know|worked with\b/.test(
      q,
    )
  )
    return "What are your skills?";
  if (/\bprojects?|portfolio|built|build|shipped|case\s*stud/.test(q))
    return "What projects are you most proud of?";
  if (/\b(contact|reach|email|connect|linkedin|github|get in touch)\b/.test(q))
    return "How can I reach you?";
  if (
    /\b(who|about|yourself|introduce|intro|background|bio|hire|fit|strength|weakness|research|experience)\b/.test(
      q,
    )
  )
    return "Who are you?";
  return null;
}

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: {
    duration: 0.32,
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

const Chat = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query");
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [presetReply, setPresetReply] = useState<PresetReplyState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef<string>("");

  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    stop,
    setInput,
    setMessages,
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

      // Graceful fallback: if the free model fails (rate-limit / quota / slow),
      // surface the closest instant preset card instead of a dead error, so a
      // recruiter still gets a real answer with zero model dependency.
      const presetKey = mapQueryToPresetKey(lastQueryRef.current);
      if (presetKey && presetReplies[presetKey]) {
        const preset = presetReplies[presetKey];
        setPresetReply({
          question: presetKey,
          reply: preset.reply,
          tool: preset.tool,
        });
        setErrorMessage(null);
        toast("The live model is busy — here's an instant answer instead.", {
          duration: 4000,
          style: {
            background: "#eef2ff",
            border: "1px solid #c7d2fe",
            color: "#3730a3",
            fontSize: "14px",
            fontWeight: "500",
          },
        });
        return;
      }

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

  const { currentAIMessage, latestUserMessage } = useMemo(() => {
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
    };

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  // Keep the conversation pinned to the latest content as it streams in, but
  // only when the user is already near the bottom — never yank them back up if
  // they've scrolled to re-read an earlier part of the answer.
  const streamingContentLength =
    typeof currentAIMessage?.content === "string"
      ? currentAIMessage.content.length
      : 0;

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 240) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [streamingContentLength, loadingSubmit, presetReply, errorMessage]);

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
      lastQueryRef.current = query;
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
      lastQueryRef.current = query;
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

  const resetConversation = useCallback(() => {
    stop();
    setMessages([]);
    setPresetReply(null);
    setErrorMessage(null);
    setLoadingSubmit(false);
    setInput("");
  }, [setInput, setMessages, stop]);

  const isEmptyState =
    !currentAIMessage &&
    !latestUserMessage &&
    !loadingSubmit &&
    !presetReply &&
    !errorMessage;

  const showComposerRoutes = !isEmptyState;

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
    <MotionConfig reducedMotion="user">
      <div className="relative flex h-[100dvh] flex-col overflow-hidden">
        <AuroraBackground />
        <SpotlightCursor />

        {/* ── Identity bar ── */}
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="relative z-10 shrink-0 px-3 pt-3 sm:px-5 sm:pt-5"
        >
          <div className="glass-panel mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-[22px] px-3 py-2.5 sm:px-4">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3"
              aria-label={`${portfolioConfig.personal.name} — home`}
            >
              <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-[14px] ring-2 ring-white/70 transition-transform duration-300 group-hover:scale-[1.04]">
                <Image
                  src="/avatar.png"
                  alt={`${portfolioConfig.personal.name} avatar`}
                  fill
                  sizes="44px"
                  priority
                  className="object-cover object-[center_top]"
                />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
                  {portfolioConfig.personal.name}
                </span>
                <span className="block truncate text-xs font-medium text-indigo-600 dark:text-indigo-300">
                  {portfolioConfig.personal.title}
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download résumé"
                  className="shine inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/50 dark:shadow-indigo-900/40"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Résumé</span>
                </a>
              )}

              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-700 backdrop-blur-sm dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300 lg:inline-flex">
                <span className="led-green" />
                Open to work
              </span>

              {directLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="glass-chip glass-hover shine inline-flex h-9 w-9 items-center justify-center rounded-full"
                  >
                    <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                  </Link>
                );
              })}

              <ThemeToggle />

              {!isEmptyState && (
                <button
                  type="button"
                  onClick={resetConversation}
                  aria-label="Start a new chat"
                  className="glass-chip glass-hover inline-flex h-9 w-9 items-center justify-center rounded-full"
                >
                  <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </motion.header>

        {/* ── Conversation + composer ── */}
        <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-3 pb-3 sm:px-5 sm:pb-5">
          <div
            ref={messagesRef}
            className="custom-scrollbar w-full max-w-3xl min-h-0 flex-1 overflow-y-auto"
          >
            <AnimatePresence mode="wait">
              {isEmptyState ? (
                <motion.div
                  key="landing"
                  {...MOTION_CONFIG}
                  className="flex min-h-full flex-col items-center justify-center py-8"
                >
                  <ChatLanding
                    submitQuery={submitQuery}
                    handlePresetReply={handlePresetReply}
                  />
                </motion.div>
              ) : presetReply ? (
                <motion.div key="preset" {...MOTION_CONFIG} className="py-6">
                  <PresetReply
                    question={presetReply.question}
                    reply={presetReply.reply}
                    tool={presetReply.tool}
                    onGetAIResponse={handleGetAIResponse}
                    onClose={() => setPresetReply(null)}
                  />
                </motion.div>
              ) : errorMessage ? (
                <motion.div key="error" {...MOTION_CONFIG} className="py-6">
                  <div className="glass-card mx-auto w-full max-w-2xl rounded-[26px] border border-amber-200/70 bg-amber-50/70 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-4">
                        <div>
                          <p className="section-kicker text-amber-700">
                            {errorCardCopy.kicker}
                          </p>
                          <h3 className="font-display text-safe-balance mt-2 text-2xl font-semibold text-amber-800">
                            {errorCardCopy.title}
                          </h3>
                        </div>

                        <div className="space-y-3 text-sm leading-7 text-amber-900/80">
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
                            className="rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
                          >
                            Show contact card
                          </button>
                          <button
                            onClick={() => {
                              setErrorMessage(null);
                              router.push("/");
                            }}
                            className="rounded-full border border-amber-600/30 bg-white/70 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-white"
                          >
                            Back to start
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
                  className="space-y-4 py-6"
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

          {/* ── Docked composer ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut, delay: 0.1 }}
            className="w-full max-w-3xl shrink-0 pt-3"
          >
            <AnimatePresence initial={false}>
              {showComposerRoutes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="mb-3 overflow-hidden"
                >
                  <HelperBoost
                    submitQuery={submitQuery}
                    handlePresetReply={handlePresetReply}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              isToolInProgress={isToolInProgress}
            />
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
};

export default Chat;
