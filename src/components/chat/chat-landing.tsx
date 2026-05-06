"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Code2,
  FlaskConical,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { getConfig, presetReplies } from "@/lib/config-loader";

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
}

const config = getConfig();

/* ── Typewriter hook ── */
function useTypewriter(words: string[], typingSpeed = 65, deletingSpeed = 35, pause = 2200) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex <= current.length) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      }, typingSpeed);
    } else if (!deleting && charIndex > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIndex));
        setCharIndex((c) => c - 1);
      }, deletingSpeed);
    } else {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words, typingSpeed, deletingSpeed, pause]);

  return text;
}

const roles = ["ML Engineer", "AI Systems Builder", "Research Engineer", "LLM Tooling Specialist"];

const queryCommands = [
  {
    label: "Who are you?",
    description: "Background, approach to building, and what drives the work.",
    question: "Who are you?",
    icon: Sparkles,
    gradient: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    label: "Show projects",
    description: "Shipped ML systems, models, and measurable outcomes.",
    question: "What projects are you most proud of?",
    icon: Code2,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    iconColor: "text-violet-600",
  },
  {
    label: "List capabilities",
    description: "ML stack, web engineering, DevOps depth.",
    question: "What are your skills?",
    icon: FlaskConical,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    label: "Pull résumé",
    description: "Education, experience, certifications.",
    question: "Can I see your resume?",
    icon: Briefcase,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconColor: "text-amber-700",
  },
  {
    label: "Contact paths",
    description: "Email, GitHub, LinkedIn — direct links.",
    question: "How can I reach you?",
    icon: Mail,
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    border: "border-rose-100",
    iconColor: "text-rose-600",
  },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const ChatLanding: React.FC<ChatLandingProps> = ({ submitQuery, handlePresetReply }) => {
  const role = useTypewriter(roles);

  const handleQuestionClick = (questionText: string) => {
    const preset = presetReplies[questionText as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(questionText, preset.reply, preset.tool);
    } else {
      submitQuery(questionText);
    }
  };

  return (
    <motion.div
      className="grid w-full min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_290px]"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* ── Left column ── */}
      <div className="min-w-0 space-y-5">

        {/* Hero card */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm px-7 py-8"
        >
          {/* Decorative gradient blobs */}
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #86efac 0%, transparent 70%)" }}
          />

          <motion.p
            variants={fadeUp}
            className="section-kicker mb-4"
          >
            Candidate Profile
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-safe-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
          >
            Hi, I&apos;m{" "}
            <span className="gradient-text">{config.personal.name.split(" ")[0]}</span>
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="mt-3 flex items-center gap-2 h-8"
          >
            <span className="text-lg font-medium text-slate-500">
              {role}
              <span className="cursor-blink" />
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-4 flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center gap-1.5">
              <span className="led-green" />
              <span className="text-sm font-medium text-emerald-700">
                Available for opportunities
              </span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {config.personal.location}
            </div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-safe-wrap mt-5 max-w-xl text-sm leading-7 text-slate-600"
          >
            {config.personal.bio}
          </motion.p>
        </motion.div>

        {/* Query command grid */}
        <motion.div
          variants={stagger}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {queryCommands.map((cmd) => (
            <motion.button
              key={cmd.label}
              variants={fadeUp}
              whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(79,70,229,0.12)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleQuestionClick(cmd.question)}
              className={`group relative overflow-hidden rounded-2xl border ${cmd.border} ${cmd.bg} p-4 text-left transition-colors hover:border-indigo-200`}
            >
              {/* Icon */}
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100">
                <cmd.icon className={`h-4.5 w-4.5 ${cmd.iconColor}`} size={18} />
              </div>
              <p className="text-safe-wrap text-sm font-semibold text-slate-900">
                {cmd.label}
              </p>
              <p className="text-safe-wrap mt-1 text-xs leading-5 text-slate-500">
                {cmd.description}
              </p>
              <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-500" />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ── Right column ── */}
      <div className="min-w-0 space-y-3">

        {/* Availability card */}
        <motion.button
          variants={fadeUp}
          whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(5,150,105,0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuestionClick("Am I available for opportunities?")}
          className="w-full min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left transition-colors hover:border-emerald-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="led-green" />
            <span className="font-mono text-[0.65rem] font-bold tracking-[0.2em] text-emerald-700 uppercase">
              Status · Active
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">Open to opportunities</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            ML Engineer · AI Systems · Immediate start. Ask about fit.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            {config.personal.location}
          </div>
        </motion.button>

        {/* Target roles */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
            <span className="mono-label">Target Roles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.personal.targetRoles.map((role) => (
              <span
                key={role}
                className="text-safe-wrap rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100"
              >
                {role}
              </span>
            ))}
          </div>
        </motion.div>

        {/* System info */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-3.5 w-3.5 text-indigo-600" />
            <span className="mono-label">How this works</span>
          </div>
          <div className="space-y-3 text-xs leading-5">
            <div className="flex gap-2.5">
              <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-safe-wrap text-slate-600">
                Each query calls a tool that renders portfolio data as a structured card.
              </span>
            </div>
            <div className="flex gap-2.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
              <span className="text-safe-wrap text-slate-600">
                Rate-limited and filtered. Safe to share with recruiters.
              </span>
            </div>
            <div className="flex gap-2.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
              <span className="text-safe-wrap text-slate-600">
                Redirects to direct contact when a live conversation is better.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatLanding;
