"use client";

import { motion } from "framer-motion";
import { Easing } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  Mail,
  MapPin,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import React from "react";

import { getConfig, presetReplies } from "@/lib/config-loader";

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
}

const config = getConfig();

const modelCardRows = [
  { label: "ID", value: config.personal.handle, mono: true },
  { label: "Architecture", value: config.personal.title },
  {
    label: "Training",
    value: `${config.education.completed1.institution} · ${config.education.completed1.degree}`,
  },
  {
    label: "Benchmarks",
    value: `${config.projects.length} systems shipped · ASR WER ↓48% · OCR CER → 0%`,
  },
  { label: "Inference", value: "Available immediately · Remote / Hybrid" },
  { label: "Location", value: config.personal.location },
];

const queryCommands = [
  {
    cmd: "getPresentation()",
    label: "Who are you?",
    description: "Intro, background, and how Divanshu approaches building.",
    color: "#00d4aa",
    question: "Who are you?",
  },
  {
    cmd: "getProjects()",
    label: "Show projects",
    description: "Featured builds — models, metrics, links.",
    color: "#00d4aa",
    question: "What projects are you most proud of?",
  },
  {
    cmd: "getSkills()",
    label: "List capabilities",
    description: "ML systems, LLM tooling, production engineering depth.",
    color: "#00d4aa",
    question: "What are your skills?",
  },
  {
    cmd: "getResume()",
    label: "Pull résumé",
    description: "Experience, education, certifications.",
    color: "#f59e0b",
    question: "Can I see your resume?",
  },
  {
    cmd: "getContact()",
    label: "Contact paths",
    description: "Email, GitHub, LinkedIn — direct to the source.",
    color: "#f59e0b",
    question: "How can I reach you?",
  },
];

const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
}) => {
  const handleQuestionClick = (questionText: string) => {
    const preset = presetReplies[questionText as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(questionText, preset.reply, preset.tool);
    } else {
      submitQuery(questionText);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as Easing },
    },
  };

  return (
    <motion.div
      className="grid w-full min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Left: Model Card + Query Grid ── */}
      <motion.div className="min-w-0 space-y-4" variants={itemVariants}>
        {/* Model Card */}
        <div className="console-surface overflow-hidden rounded-2xl">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-[#1a2535] bg-[#080c12] px-5 py-3">
            <div className="flex items-center gap-3">
              <Terminal className="h-3.5 w-3.5 text-[#00d4aa]" />
              <span className="font-mono text-[0.65rem] font-semibold tracking-[0.22em] text-[#00d4aa] uppercase opacity-80">
                MODEL_CARD · v1.0
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-green" />
              <span className="font-mono text-[0.65rem] font-semibold tracking-[0.18em] text-[#00d4aa] uppercase opacity-75">
                ONLINE
              </span>
            </div>
          </div>

          {/* Card Fields */}
          <div className="divide-y divide-[#1a2535]">
            {modelCardRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr]"
              >
                <div className="bg-[#080c12]/60 px-5 py-3 font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-[#00d4aa] uppercase opacity-65 flex items-center">
                  {row.label}
                </div>
                <div
                  className={`px-5 py-3 text-sm text-[#c5d5e8] leading-6 ${row.mono ? "font-mono text-[#00d4aa]" : ""}`}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {/* Card Footer */}
          <div className="border-t border-[#1a2535] bg-[#080c12]/40 px-5 py-3">
            <p className="font-mono text-[0.62rem] text-[#2a3d55] leading-5">
              Query this model using the commands below or type a free-form
              question. Tool results render as structured cards.
            </p>
          </div>
        </div>

        {/* Query Commands Grid */}
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {queryCommands.map((cmd) => (
            <motion.button
              key={cmd.cmd}
              className="group console-surface btn-sweep min-w-0 rounded-xl p-4 text-left transition-all duration-200 hover:border-[#00d4aa]/25"
              onClick={() => handleQuestionClick(cmd.question)}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="font-mono text-[0.7rem] font-semibold tracking-wide"
                  style={{ color: cmd.color }}
                >
                  &gt;&gt; {cmd.cmd}
                </span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: cmd.color }}
                />
              </div>
              <p className="text-safe-wrap text-sm font-semibold text-[#e2e8f0]">
                {cmd.label}
              </p>
              <p className="text-safe-wrap mt-1.5 text-xs leading-5 text-[#5c7080]">
                {cmd.description}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Right: Status + Context ── */}
      <div className="min-w-0 space-y-3">
        {/* Availability Status */}
        <motion.button
          onClick={() =>
            handleQuestionClick("Am I available for opportunities?")
          }
          className="console-surface btn-sweep w-full min-w-0 rounded-2xl p-5 text-left transition-all hover:border-[#00d4aa]/25"
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="led-green" />
            <span className="font-mono text-[0.65rem] font-semibold tracking-[0.2em] text-[#00d4aa] uppercase opacity-75">
              STATUS · ACTIVE
            </span>
          </div>
          <p className="text-safe-wrap text-base font-semibold text-[#e2e8f0]">
            Open to opportunities
          </p>
          <p className="text-safe-wrap mt-2 text-xs leading-5 text-[#5c7080]">
            ML Engineer / AI Systems · Immediate start · Ask about role fit.
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-[#5c7080]" />
            <span className="font-mono text-[0.65rem] text-[#5c7080]">
              {config.personal.location}
            </span>
          </div>
        </motion.button>

        {/* Target Roles */}
        <motion.div
          className="console-surface rounded-2xl p-5"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-3.5 w-3.5 text-[#00d4aa]" />
            <span className="mono-label">Target Roles</span>
          </div>
          <div className="space-y-1.5">
            {config.personal.targetRoles.map((role) => (
              <div key={role} className="flex items-center gap-2">
                <span className="font-mono text-[#00d4aa] text-xs opacity-50">
                  ›
                </span>
                <span className="text-xs text-[#8b9db5]">{role}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div
          className="console-surface rounded-2xl p-5"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-3.5 w-3.5 text-[#00d4aa]" />
            <span className="mono-label">System Info</span>
          </div>
          <div className="space-y-3 text-xs leading-5 text-[#5c7080]">
            <div className="flex gap-2.5">
              <Zap className="h-3.5 w-3.5 shrink-0 text-[#f59e0b] mt-0.5" />
              <span className="text-safe-wrap">
                Tool calls render portfolio data as structured cards — not vague
                summaries.
              </span>
            </div>
            <div className="flex gap-2.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#00d4aa] mt-0.5" />
              <span className="text-safe-wrap">
                Rate-limited, origin-checked, and filtered for injection
                patterns.
              </span>
            </div>
            <div className="flex gap-2.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#5c7080] mt-0.5" />
              <span className="text-safe-wrap">
                Redirects to direct contact when a live conversation is the
                better path.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatLanding;
