"use client";

import { getConfig } from "@/lib/config-loader";
import { motion, useInView, easeOut } from "framer-motion";
import { useRef } from "react";

export interface SkillsCardData {
  technicalSkills?: {
    programming?: string[];
    machineLearning?: string[];
    webDevelopment?: string[];
    databases?: string[];
    devOpsCloud?: string[];
    softSkills?: string[];
  };
}

interface Section {
  id: string;
  label: string;
  accent: string;
  border: string;
  bg: string;
  textColor: string;
  skills: string[];
  levels: number[];
}

function SkillBar({ level, accent, delay }: { level: number; accent: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const pct = (level / 5) * 100;

  return (
    <div ref={ref} className="skill-track">
      <motion.div
        className="skill-bar"
        style={{ background: accent }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      />
    </div>
  );
}

const Skills = ({ data }: { data?: SkillsCardData }) => {
  const config = getConfig();
  const t = data?.technicalSkills;

  const sections: Section[] = [
    {
      id: "prog",
      label: "Programming",
      accent: "#4f46e5",
      border: "border-indigo-200",
      bg: "bg-indigo-50",
      textColor: "text-indigo-700",
      skills: t?.programming ?? config.skills.programming,
      levels: [5, 5, 4, 4, 5, 5, 4, 4, 4, 4],
    },
    {
      id: "ml",
      label: "ML / AI",
      accent: "#7c3aed",
      border: "border-violet-200",
      bg: "bg-violet-50",
      textColor: "text-violet-700",
      skills: t?.machineLearning ?? config.skills.ml_ai,
      levels: [5, 5, 5, 4, 5, 5, 4, 4, 4, 4, 4, 4],
    },
    {
      id: "web",
      label: "Web Engineering",
      accent: "#059669",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      textColor: "text-emerald-700",
      skills: t?.webDevelopment ?? config.skills.web_development,
      levels: [5, 4, 5, 5, 4, 4, 4, 4, 4],
    },
    {
      id: "db",
      label: "Databases",
      accent: "#d97706",
      border: "border-amber-200",
      bg: "bg-amber-50",
      textColor: "text-amber-700",
      skills: t?.databases ?? config.skills.databases,
      levels: [4, 4, 4, 3, 4],
    },
    {
      id: "devops",
      label: "DevOps & Cloud",
      accent: "#0284c7",
      border: "border-sky-200",
      bg: "bg-sky-50",
      textColor: "text-sky-700",
      skills: t?.devOpsCloud ?? config.skills.devops_cloud,
      levels: [4, 4, 3, 4, 4, 3],
    },
    {
      id: "soft",
      label: "Soft Skills",
      accent: "#e11d48",
      border: "border-rose-200",
      bg: "bg-rose-50",
      textColor: "text-rose-700",
      skills: t?.softSkills ?? config.skills.soft_skills,
      levels: [5, 5, 5, 5, 5],
    },
  ].filter((s) => s.skills.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="mx-auto w-full max-w-5xl min-w-0 py-6 px-1 sm:px-2"
    >
      <div className="mb-7 px-1">
        <p className="section-kicker">Capability Matrix</p>
        <h2 className="font-display text-safe-balance mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Skills & Expertise
        </h2>
        <p className="text-safe-wrap mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Depth per domain — verified by shipped systems and research output.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, si) => (
          <motion.div
            key={section.id}
            className={`overflow-hidden rounded-2xl border ${section.border} bg-white shadow-sm dark:border-white/10 dark:bg-slate-900`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut, delay: si * 0.07 }}
          >
            {/* Header */}
            <div className={`flex items-center gap-3 border-b ${section.border} ${section.bg} px-5 py-3 dark:border-white/10 dark:bg-white/[0.04]`}>
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: section.accent }}
              />
              <span className={`font-mono text-[0.7rem] font-bold tracking-[0.18em] uppercase ${section.textColor}`}>
                {section.label}
              </span>
              <span className="font-mono text-[0.62rem] text-slate-400 dark:text-slate-500 ml-auto">
                {section.skills.length} skills
              </span>
            </div>

            {/* Skill rows */}
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {section.skills.map((skill, i) => {
                const level = section.levels[i] ?? 4;
                return (
                  <div
                    key={skill}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-safe-wrap w-40 shrink-0 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {skill}
                    </span>
                    <div className="flex-1 min-w-0">
                      <SkillBar
                        level={level}
                        accent={section.accent}
                        delay={si * 0.05 + i * 0.03}
                      />
                    </div>
                    <span className="font-mono text-[0.65rem] text-slate-400 dark:text-slate-500 tabular-nums w-6 text-right shrink-0">
                      {level}/5
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-4 px-1">
        <span className="font-mono text-[0.6rem] text-slate-400 dark:text-slate-500 tracking-wider uppercase">Legend</span>
        {["Learning", "Familiar", "Proficient", "Advanced", "Expert"].map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="skill-track w-10">
              <div
                className="skill-bar"
                style={{ width: `${((i + 1) / 5) * 100}%`, background: "#4f46e5" }}
              />
            </div>
            <span className="font-mono text-[0.6rem] text-slate-400 dark:text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Skills;
