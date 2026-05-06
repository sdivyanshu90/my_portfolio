"use client";

import { ChatRequestOptions } from "ai";
import { motion } from "framer-motion";
import { ArrowUpRight, Square } from "lucide-react";
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  useEffect(() => {
    const textarea = inputRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="rounded-[30px] border border-[#d7dee7] bg-white/92 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <p className="section-kicker mb-2">Prompt</p>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={
                  isToolInProgress
                    ? "A tool is already running..."
                    : "Ask about projects, research, system design, availability, or contact details."
                }
                className="min-h-[72px] max-h-[180px] w-full resize-none border-none bg-transparent text-[15px] leading-7 text-[#112133] placeholder:text-[#6b7280] focus:outline-none"
                disabled={isToolInProgress || isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={(!isLoading && !input.trim()) || isToolInProgress}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#102133] text-white transition hover:-translate-y-0.5 disabled:opacity-50"
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                  stop();
                }
              }}
              aria-label={isLoading ? "Stop response" : "Send prompt"}
            >
              {isLoading ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1f5] px-1 pt-3 text-xs text-[#697586]">
            <span>Press Enter to send. Use Shift+Enter for a new line.</span>
            <span>{input.length}/2000</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
