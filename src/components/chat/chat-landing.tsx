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
