"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Code2,
  FlaskConical,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { getConfig, presetReplies } from "@/lib/config-loader";

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
}

const config = getConfig();
const firstName = config.personal.name.split(" ")[0];
const tagline = `${config.personal.bio.split(". ")[0]}.`;

// Quick facts a recruiter can scan with zero interaction.
const topCompany = config.experience[0]?.company ?? "";
const topSkills = (
  config.skills.ml_ai?.length ? config.skills.ml_ai : config.skills.programming
)
  .slice(0, 2)
  .join(" · ");
const projectCount = config.projects.length;

/* ── Typewriter hook ── */
function useTypewriter(
  words: string[],
  typingSpeed = 70,
  deletingSpeed = 35,
  pause = 2000,
) {
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

const roles = [
  "ML Engineer",
  "AI Systems Builder",
  "Research Engineer",
  "LLM Tooling Specialist",
];

const suggestions = [
  { label: "Who are you?", question: "Who are you?", icon: Sparkles },
  {
    label: "Best projects",
    question: "What projects are you most proud of?",
    icon: Code2,
  },
  { label: "Your skills", question: "What are your skills?", icon: FlaskConical },
  { label: "Résumé", question: "Can I see your resume?", icon: Briefcase },
  { label: "Contact", question: "How can I reach you?", icon: Mail },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
}) => {
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
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex w-full max-w-2xl flex-col items-center text-center"
    >
      {/* Avatar with aurora halo */}
      <motion.div
        variants={fadeUp}
        className="relative mb-7"
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="avatar-halo" aria-hidden />
        <span className="relative block h-28 w-28 overflow-hidden rounded-[2rem] ring-4 ring-white/80 shadow-xl sm:h-32 sm:w-32">
          <Image
            src="/avatar.png"
            alt={`${config.personal.name} avatar`}
            fill
            sizes="128px"
            priority
            className="object-cover object-[center_top]"
          />
        </span>
      </motion.div>

      <motion.p variants={fadeUp} className="section-kicker mb-3">
        AI Portfolio · Ask me anything
      </motion.p>

      <motion.h1
        variants={fadeUp}
        className="font-display text-safe-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl"
      >
        Hi, I&apos;m <span className="gradient-text">{firstName}</span>
      </motion.h1>

      <motion.div
        variants={fadeUp}
        className="mt-3 flex h-8 items-center justify-center text-lg font-medium text-slate-500 dark:text-slate-300 sm:text-xl"
      >
        <span>
          {role}
          <span className="cursor-blink" />
        </span>
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="text-safe-wrap mt-5 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base"
      >
        {tagline}
      </motion.p>

      {/* Quick facts — scannable with zero interaction */}
      <motion.div
        variants={fadeUp}
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
      >
        <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <span className="led-green" />
          Available now
        </span>
        <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
          <span className="text-safe-wrap">{config.personal.location}</span>
        </span>
        {topCompany && (
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Briefcase className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
            <span className="text-safe-wrap">{topCompany}</span>
          </span>
        )}
        {topSkills && (
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Code2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
            <span className="text-safe-wrap">{topSkills}</span>
          </span>
        )}
        <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
          {projectCount} projects
        </span>
      </motion.div>

      {/* Suggestion chips */}
      <motion.div
        variants={stagger}
        className="mt-9 flex flex-wrap items-center justify-center gap-2.5"
      >
        {suggestions.map((s) => (
          <motion.button
            key={s.label}
            variants={fadeUp}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleQuestionClick(s.question)}
            className="glass-chip glass-hover shine group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            <s.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            {s.label}
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-500" />
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ChatLanding;
