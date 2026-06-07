"use client";

import { ChatRequestOptions } from "ai";
import { motion } from "framer-motion";
import { ArrowUp, Square } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ChatBottombarProps {
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  isLoading: boolean;
  stop: () => void;
  input: string;
  isToolInProgress: boolean;
}

const PLACEHOLDERS = [
  "Ask me anything about my work…",
  "Why should you hire me?",
  "Tell me about your research at Yale…",
  "Which projects are you most proud of?",
  "What does your tech stack look like?",
];

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
}: ChatBottombarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [phIndex, setPhIndex] = useState(0);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Auto-grow the textarea with its content.
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  // Gently rotate the placeholder while the field is empty.
  useEffect(() => {
    if (input) return;
    const id = setInterval(
      () => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length),
      3600,
    );
    return () => clearInterval(id);
  }, [input]);

  const isDisabled = isToolInProgress || isLoading;
  const canSubmit = Boolean(!isDisabled && input.trim());
  const placeholder = isToolInProgress
    ? "Running tool call…"
    : isLoading
      ? "Generating response…"
      : PLACEHOLDERS[phIndex];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full"
    >
      <div className="input-shell glass-inset flex items-end gap-2 rounded-[26px] border border-white/50 p-2 pl-5 dark:border-white/10">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          rows={1}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-label="Message"
          className="min-h-[44px] max-h-[180px] flex-1 resize-none bg-transparent py-3 text-[0.95rem] leading-6 text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
        />

        <motion.button
          type="submit"
          disabled={!canSubmit && !isLoading}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            if (isLoading) {
              e.preventDefault();
              stop();
            }
          }}
          aria-label={isLoading ? "Stop generation" : "Send message"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
            isLoading
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : canSubmit
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 hover:shadow-indigo-500/50 active:scale-95 dark:shadow-indigo-900/50"
                : "cursor-not-allowed bg-slate-200/70 text-slate-400 dark:bg-white/10 dark:text-slate-500"
          }`}
        >
          {isLoading ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <motion.span
              animate={canSubmit ? { y: [0, -2, 0] } : { y: 0 }}
              transition={{
                duration: 1.4,
                repeat: canSubmit ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.6} />
            </motion.span>
          )}
        </motion.button>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2.5 text-[0.62rem] text-slate-400 dark:text-slate-500">
        <span className="inline-flex items-center gap-1">
          <kbd className="rounded-md border border-slate-300/50 bg-white/50 px-1.5 py-0.5 font-sans text-[0.6rem] font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            Enter
          </kbd>
          to send
          <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
          <kbd className="rounded-md border border-slate-300/50 bg-white/50 px-1.5 py-0.5 font-sans text-[0.6rem] font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            Shift + Enter
          </kbd>
          newline
        </span>
        {input.length > 0 && (
          <span
            className={`font-mono tabular-nums ${
              input.length > 1800 ? "text-red-500" : ""
            }`}
          >
            {input.length}/2000
          </span>
        )}
      </div>
    </motion.form>
  );
}
