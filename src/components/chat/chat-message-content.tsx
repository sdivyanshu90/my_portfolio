"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";

interface ChatMessageContentProps {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
  reload: (opts?: ChatRequestOptions) => Promise<string | null | undefined | null>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  skipToolRendering?: boolean;
}

function extractText(message: Message): string {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return (message.content as Array<{ type: string; text?: string }>)
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("\n");
  }
  return "";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-[0.65rem] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ChatMessageContent({
  message,
  isLast,
  isLoading,
}: ChatMessageContentProps) {
  const [open, setOpen] = useState(true);
  const content = extractText(message);
  const isAssistant = message.role === "assistant";
  const isStreaming = isAssistant && isLoading && isLast;

  if (!isAssistant) {
    return (
      <p className="text-safe-wrap text-sm leading-6 text-white">{content}</p>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-0.5 text-left">
        <span className="font-mono text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-indigo-600 opacity-80 dark:text-indigo-300">
          Response
        </span>
        <span className="text-slate-400 dark:text-slate-500">
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeText = String(children).replace(/\n$/, "");
              const isBlock = match || codeText.includes("\n");

              if (isBlock) {
                return (
                  <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                      <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                        {match?.[1] ?? "code"}
                      </span>
                      <CopyButton text={codeText} />
                    </div>
                    <pre className="overflow-x-auto bg-white px-4 py-4 text-[0.82rem] leading-7 text-slate-800 dark:bg-slate-900 dark:text-slate-200" style={{ fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)" }}>
                      <code>{codeText}</code>
                    </pre>
                  </div>
                );
              }

              return (
                <code
                  className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[0.82em] text-indigo-700 border border-indigo-100 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h1 className="font-display text-safe-balance mt-6 mb-3 text-xl font-bold text-slate-900 first:mt-0 dark:text-white">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-display text-safe-balance mt-5 mb-2 text-lg font-semibold text-slate-900 first:mt-0 dark:text-white">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-safe-balance mt-4 mb-2 text-base font-semibold text-slate-800 first:mt-0 dark:text-slate-100">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-safe-wrap mb-3 text-sm leading-7 text-slate-700 last:mb-0 dark:text-slate-300">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-3 space-y-1.5 pl-2 last:mb-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 space-y-1.5 pl-4 list-decimal last:mb-0">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-safe-wrap flex gap-2 items-start text-sm text-slate-700 leading-6 dark:text-slate-300">
                <span className="font-bold text-indigo-500 mt-0.5 shrink-0">·</span>
                <span>{children}</span>
              </li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500 transition-colors dark:text-indigo-300 dark:decoration-indigo-400/40"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-4 border-l-4 border-indigo-300 bg-indigo-50 pl-4 pr-3 py-3 rounded-r-lg text-sm text-slate-600 italic dark:border-indigo-400/40 dark:bg-indigo-400/10 dark:text-slate-300">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-white/10">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-50 border-b border-slate-200 dark:bg-white/5 dark:border-white/10">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700 text-xs uppercase tracking-wider dark:text-slate-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-t border-slate-100 px-4 py-2.5 text-slate-600 dark:border-white/10 dark:text-slate-300">{children}</td>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-slate-600 dark:text-slate-400">{children}</em>
            ),
            hr: () => <hr className="my-5 border-slate-200 dark:border-white/10" />,
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span
            className="cursor-blink -mt-1 inline-block align-text-bottom text-indigo-600"
            aria-hidden
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
