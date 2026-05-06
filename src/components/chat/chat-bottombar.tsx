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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="relative w-full">
        <motion.div
          animate={{
            boxShadow: isDisabled
              ? "0 0 0 1px rgba(226,232,240,1), 0 4px 16px rgba(15,23,42,0.04)"
              : "0 0 0 2px rgba(79,70,229,0.18), 0 4px 24px rgba(79,70,229,0.08)",
          }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
        >
          {/* Input row */}
          <div className="flex items-start gap-0">
            {/* Blinking cursor when empty */}
            {!input && !isDisabled && (
              <span
                className="cursor-blink pointer-events-none absolute left-[3.2rem] top-[1.05rem] font-mono text-sm text-indigo-500 opacity-70 select-none"
                aria-hidden
              />
            )}

            {/* Prompt glyph */}
            <div className="flex items-start px-4 pt-[1.05rem] pb-2 select-none shrink-0">
              <span
                className={`font-mono text-sm font-bold transition-colors duration-150 ${
                  isDisabled ? "text-slate-300" : "text-indigo-500"
                }`}
              >
                &gt;
              </span>
            </div>

            {/* Textarea */}
            <div className="flex-1 min-w-0 pt-[0.9rem] pb-2 pr-4">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={
                  isToolInProgress
                    ? "Running tool call…"
                    : isLoading
                      ? "Generating response…"
                      : "Ask about projects, skills, availability, or contact…"
                }
                className="min-h-[56px] max-h-[180px] w-full resize-none border-none bg-transparent text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.62rem] text-slate-400 tracking-wider">
                ENTER to send · SHIFT+ENTER for newline
              </span>
              {input.length > 0 && (
                <span
                  className={`font-mono text-[0.62rem] tabular-nums ${
                    input.length > 1800 ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  {input.length}/2000
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit && !isLoading}
              className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-mono text-xs font-bold tracking-[0.1em] uppercase transition-all duration-150
                ${
                  isLoading
                    ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : canSubmit
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                }`}
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                  stop();
                }
              }}
              aria-label={isLoading ? "Stop generation" : "Send message"}
            >
              {isLoading ? (
                <>
                  <Square className="h-3 w-3 fill-current" />
                  Stop
                </>
              ) : (
                "Send ↵"
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
