"use client";

import { Message } from "ai/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export type ChatMessageContentProps = {
  message: Message;
  isLast?: boolean;
  isLoading?: boolean;
  reload?: () => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  skipToolRendering?: boolean;
};

const CodeBlock = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  const firstLineBreak = content.indexOf("\n");
  const firstLine = content.substring(0, firstLineBreak).trim();
  const language = firstLine || "text";
  const code = firstLine ? content.substring(firstLineBreak + 1) : content;

  const previewLines = code.split("\n").slice(0, 1).join("\n");
  const hasMoreLines = code.split("\n").length > 1;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-4 w-full overflow-hidden rounded-xl border border-[#1a2535]"
    >
      <div className="flex items-center justify-between bg-[#080c12] border-b border-[#1a2535] px-4 py-2">
        <span className="font-mono text-[0.65rem] font-semibold tracking-[0.15em] text-[#00d4aa] uppercase opacity-70">
          {language !== "text" ? language : "code"}
        </span>
        <CollapsibleTrigger className="rounded p-1 hover:bg-[#1a2535] transition-colors">
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-[#5c7080]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[#5c7080]" />
          )}
        </CollapsibleTrigger>
      </div>

      <div className="bg-[#0e1520]">
        {!isOpen && hasMoreLines ? (
          <pre className="px-4 py-3">
            <code className="font-mono text-xs text-[#8b9db5]">
              {previewLines + "\n…"}
            </code>
          </pre>
        ) : (
          <CollapsibleContent>
            <div className="custom-scrollbar" style={{ overflowX: "auto" }}>
              <pre className="min-w-max px-4 py-3">
                <code className="font-mono text-xs text-[#c5d5e8] whitespace-pre leading-6">
                  {code}
                </code>
              </pre>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};

export default function ChatMessageContent({
  message,
}: ChatMessageContentProps) {
  const renderContent = () => {
    return message.parts?.map((part, partIndex) => {
      if (part.type !== "text" || !part.text) return null;

      const contentParts = part.text.split("```");

      return (
        <div key={partIndex} className="w-full space-y-3">
          {contentParts.map((content, i) =>
            i % 2 === 0 ? (
              <div key={`text-${i}`} className="prose w-full max-w-none">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-safe-balance font-display mt-6 text-xl font-semibold text-[#e2e8f0] first:mt-0 tracking-tight">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-safe-balance font-display mt-5 text-lg font-semibold text-[#e2e8f0] first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-safe-balance font-display mt-4 text-base font-semibold text-[#c5d5e8] first:mt-0">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="break-words whitespace-pre-wrap leading-7 text-[#8b9db5] text-sm">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-3 space-y-1 pl-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-3 space-y-1 pl-4 list-decimal">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="my-0.5 text-sm text-[#8b9db5] leading-6 flex gap-2 items-start list-none">
                        <span className="mt-2 font-mono text-[#00d4aa] text-[0.55rem] shrink-0">
                          ›
                        </span>
                        <span>{children}</span>
                      </li>
                    ),
                    table: ({ children }) => (
                      <div className="my-4 overflow-x-auto rounded-xl border border-[#1a2535]">
                        <table className="min-w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-[#080c12]">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-[#1a2535] bg-[#0e1520]">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="align-top">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2.5 text-left font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-[#00d4aa] uppercase opacity-70">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2.5 text-sm text-[#8b9db5]">
                        {children}
                      </td>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-3 border-l-2 border-[#00d4aa]/30 pl-4 text-sm italic text-[#5c7080]">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="rounded-md bg-[#0e1520] border border-[#1a2535] px-1.5 py-0.5 font-mono text-[0.82em] text-[#00d4aa]">
                        {children}
                      </code>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00d4aa] underline underline-offset-2 decoration-[#00d4aa]/40 hover:decoration-[#00d4aa] transition-all"
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-[#c5d5e8]">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-[#8b9db5]">{children}</em>
                    ),
                    hr: () => <div className="my-4 h-px bg-[#1a2535]" />,
                  }}
                >
                  {content}
                </Markdown>
              </div>
            ) : (
              <CodeBlock key={`code-${i}`} content={content} />
            ),
          )}
        </div>
      );
    });
  };

  return <div className="w-full">{renderContent()}</div>;
}

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export type ChatMessageContentProps = {
  message: Message;
  isLast?: boolean;
  isLoading?: boolean;
  reload?: () => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  skipToolRendering?: boolean;
};

const CodeBlock = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Extract language if present in the first line
  const firstLineBreak = content.indexOf("\n");
  const firstLine = content.substring(0, firstLineBreak).trim();
  const language = firstLine || "text";
  const code = firstLine ? content.substring(firstLineBreak + 1) : content;

  // Get first few lines for preview
  const previewLines = code.split("\n").slice(0, 1).join("\n");
  const hasMoreLines = code.split("\n").length > 1;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-4 w-full overflow-hidden rounded-md"
    >
      <div className="bg-secondary text-secondary-foreground flex items-center justify-between rounded-t-md border-b px-4 py-1">
        <span className="text-xs">
          {language !== "text" ? language : "Code"}
        </span>
        <CollapsibleTrigger className="hover:bg-secondary/80 rounded p-1">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
      </div>

      <div className="bg-accent/80 text-accent-foreground rounded-b-md">
        {!isOpen && hasMoreLines ? (
          <pre className="px-4 py-3">
            <code className="text-sm">{previewLines + "\n..."}</code>
          </pre>
        ) : (
          <CollapsibleContent>
            <div className="custom-scrollbar" style={{ overflowX: "auto" }}>
              <pre className="min-w-max px-4 py-3">
                <code className="text-sm whitespace-pre">{code}</code>
              </pre>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};

export default function ChatMessageContent({
  message,
}: ChatMessageContentProps) {
  // Only handle text parts
  const renderContent = () => {
    return message.parts?.map((part, partIndex) => {
      if (part.type !== "text" || !part.text) return null;

      // Split content by code block markers
      const contentParts = part.text.split("```");

      return (
        <div key={partIndex} className="w-full space-y-4">
          {contentParts.map((content, i) =>
            i % 2 === 0 ? (
              // Regular text content
              <div key={`text-${i}`} className="prose dark:prose-invert w-full">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-safe-balance mt-6 text-2xl font-semibold first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-safe-balance mt-6 text-xl font-semibold first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-safe-balance mt-5 text-lg font-semibold first:mt-0">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="break-words whitespace-pre-wrap leading-7">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-4 list-disc space-y-1 pl-6">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-4 list-decimal space-y-1 pl-6">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="my-1">{children}</li>,
                    table: ({ children }) => (
                      <div className="my-4 overflow-x-auto">
                        <table className="min-w-full border-collapse overflow-hidden rounded-lg border border-[#d8e1e9] text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-[#eef3f8] text-left">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-[#e6ebf0]">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="align-top">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 font-semibold text-[#142132]">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-[#334155]">{children}</td>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-4 border-l-4 border-[#0b544b]/30 pl-4 italic text-[#556173]">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[0.92em]">
                        {children}
                      </code>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {content}
                </Markdown>
              </div>
            ) : (
              // Code block content
              <CodeBlock key={`code-${i}`} content={content} />
            ),
          )}
        </div>
      );
    });
  };

  return <div className="w-full">{renderContent()}</div>;
}
