"use client";

import { motion } from "framer-motion";
import { Easing } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  Bot,
  Briefcase,
  Code,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import React from "react";

import { presetReplies } from "@/lib/config-loader";

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
}

const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
}) => {
  // Suggested questions that the user can click on
  const suggestedQuestions = [
    {
      icon: <MessageSquare className="h-4 w-4" />,
      text: "Who are you?",
      blurb: "Intro, role fit, and how Divanshu approaches building.",
    },
    {
      icon: <Code className="h-4 w-4" />,
      text: "What projects are you most proud of?",
      blurb: "Featured builds with context, metrics, and links.",
    },
    {
      icon: <Award className="h-4 w-4" />,
      text: "What are your skills?",
      blurb: "ML, LLM systems, product engineering, and research depth.",
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      text: "Am I available for opportunities?",
      blurb: "Current availability, focus areas, and preferred work styles.",
    },
    {
      icon: <Mail className="h-4 w-4" />,
      text: "How can I reach you?",
      blurb: "Direct contact paths for interviews, demos, and collaboration.",
    },
  ];

  const handleQuestionClick = (questionText: string) => {
    // Check if this question has a preset reply
    const preset = presetReplies[questionText as keyof typeof presetReplies];

    if (preset && handlePresetReply) {
      // Show preset reply first
      handlePresetReply(questionText, preset.reply, preset.tool);
    } else {
      // Fall back to AI query
      submitQuery(questionText);
    }
  };

  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as Easing,
      },
    },
  };

  return (
    <motion.div
      className="grid w-full min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_280px]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="panel-surface min-w-0 overflow-hidden p-6 sm:p-8"
        variants={itemVariants}
      >
        <p className="section-kicker">Recruiter Copilot</p>
        <div className="mt-4 max-w-3xl min-w-0 space-y-4">
          <h2 className="font-display text-safe-balance text-4xl font-semibold tracking-tight text-[#102133] sm:text-5xl">
            Ask for the signal, not the small talk.
          </h2>
          <p className="text-safe-wrap max-w-2xl text-sm leading-7 text-[#556173] sm:text-base">
            This portfolio assistant stays grounded in real projects, resume
            data, and contact details. It uses tool-backed cards when structure
            matters and keeps the conversation scoped to Divanshu&apos;s work.
          </p>
        </div>

        <div className="mt-8 grid gap-3 xl:grid-cols-2">
          {suggestedQuestions.map((question, index) => (
            <motion.button
              key={index}
              className="group min-w-0 rounded-[24px] border border-[#d8e1e9] bg-white/84 p-4 text-left shadow-sm transition hover:-translate-y-1"
              onClick={() => handleQuestionClick(question.text)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef6f3] text-[#0b544b]">
                  {question.icon}
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#0b544b] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-safe-wrap mt-4 text-base font-semibold text-[#102133]">
                {question.text}
              </p>
              <p className="text-safe-wrap mt-2 text-sm leading-6 text-[#5c6675]">
                {question.blurb}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="min-w-0 space-y-4">
        <motion.button
          onClick={() =>
            handleQuestionClick("Am I available for opportunities?")
          }
          className="panel-surface flex w-full min-w-0 items-start gap-4 p-5 text-left transition hover:-translate-y-0.5"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative mt-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#22c55e]" />
          </span>
          <span className="min-w-0">
            <span className="section-kicker">Live Status</span>
            <span className="text-safe-wrap mt-2 block text-lg font-semibold text-[#102133]">
              Available for opportunities
            </span>
            <span className="text-safe-wrap mt-2 block text-sm leading-6 text-[#5c6675]">
              Ask about internship fit, full-time roles, or the kind of problem
              space that gets an immediate yes.
            </span>
          </span>
        </motion.button>

        <motion.div className="panel-surface p-5" variants={itemVariants}>
          <p className="section-kicker">How It Answers</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-[#5c6675]">
            <div className="flex min-w-0 gap-3">
              <Bot className="mt-1 h-4 w-4 shrink-0 text-[#0b544b]" />
              <p className="text-safe-wrap">
                Uses tool-backed portfolio cards when the answer should be
                structured.
              </p>
            </div>
            <div className="flex min-w-0 gap-3">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#0b544b]" />
              <p className="text-safe-wrap">
                Blocks prompt-leak, secret-exfiltration, and oversized payload
                attempts.
              </p>
            </div>
            <div className="flex min-w-0 gap-3">
              <Mail className="mt-1 h-4 w-4 shrink-0 text-[#0b544b]" />
              <p className="text-safe-wrap">
                Redirects to direct contact when a live conversation is the
                better path.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatLanding;
