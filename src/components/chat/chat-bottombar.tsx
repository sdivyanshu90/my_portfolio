"use client";

import { ChatRequestOptions } from "ai";
import { motion } from "framer-motion";
import { Square } from "lucide-react";
import React, { useEffect } from "react";

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

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

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
  }, [inputRef]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  const isDisabled = isToolInProgress || isLoading;
  const canSubmit = !isDisabled && input.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="rounded-2xl border border-[#1a2535] bg-[#0e1520]/95 backdrop-blur-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,212,170,0.05),0_16px_48px_rgba(0,0,0,0.4)]">
          {/* Input Row */}
          <div className="flex items-start gap-0">
            {/* Prompt gutter */}
            <div className="flex items-start px-4 pt-4 pb-2 select-none shrink-0">
              <span
                className={`font-mono text-sm font-semibold transition-colors ${isDisabled ? "text-[#2a3d55]" : "text-[#00d4aa]"}`}
              >
                &gt;&gt;
              </span>
            </div>

            {/* Textarea */}
            <div className="relative flex-1 min-w-0 pt-3 pb-2 pr-4">
              {/* Blinking cursor shown when empty */}
              {!input && !isDisabled && (
                <span
                  className="cursor-blink pointer-events-none absolute left-0 top-[0.9rem] font-mono text-sm leading-6 text-[#00d4aa] opacity-60 select-none"
                  aria-hidden
                />
              )}
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  isToolInProgress
                    ? "Running tool call…"
                    : isLoading
                      ? "Generating response…"
                      : "Query about projects, research, skills, availability, contact…"
                }
                className="min-h-[60px] max-h-[180px] w-full resize-none border-none bg-transparent font-mono text-sm leading-6 text-[#e2e8f0] placeholder:text-[#4a6480] focus:outline-none"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 border-t border-[#1a2535] px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.62rem] text-[#3d5470] tracking-wider">
                ENTER ↵ to run · SHIFT+ENTER for newline
              </span>
              {input.length > 0 && (
                <span
                  className={`font-mono text-[0.62rem] tabular-nums ${input.length > 1800 ? "text-[#ef4444]" : "text-[#3d5470]"}`}
                >
                  {input.length}/2000
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit && !isLoading}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 font-mono text-xs font-bold tracking-[0.12em] uppercase transition-all duration-150
                ${
                  isLoading
                    ? "bg-[#1a2535] border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/10"
                    : canSubmit
                      ? "bg-[#00d4aa] text-[#080c12] hover:bg-[#00c09a] shadow-[0_0_16px_rgba(0,212,170,0.25)]"
                      : "bg-[#141d2b] text-[#2a3d55] cursor-not-allowed border border-[#1a2535]"
                }`}
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                  stop();
                }
              }}
              aria-label={isLoading ? "Stop generation" : "Run query"}
            >
              {isLoading ? (
                <>
                  <Square className="h-3 w-3 fill-current" />
                  STOP ■
                </>
              ) : (
                "RUN ↵"
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
