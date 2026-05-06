"use client";

import { getConfig } from "@/lib/config-loader";
import { motion, easeOut } from "framer-motion";

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

interface BenchmarkSection {
  id: string;
  label: string;
  cmd: string;
  color: string;
  skills: string[];
  levels: number[]; // per-skill level, or broadcast one value
}

const Skills = ({ data }: { data?: SkillsCardData }) => {
  const config = getConfig();
  const t = data?.technicalSkills;

  const sections: BenchmarkSection[] = [
    {
      id: "prog",
      label: "Programming",
      cmd: "skills.programming",
      color: "#00d4aa",
      skills: t?.programming ?? config.skills.programming,
      levels: [5, 5, 4, 4, 5, 5, 4, 4, 4, 4],
    },
    {
      id: "ml",
      label: "ML / AI",
      cmd: "skills.ml_ai",
      color: "#a78bfa",
      skills: t?.machineLearning ?? config.skills.ml_ai,
      levels: [5, 5, 5, 4, 5, 5, 4, 4, 4, 4, 4, 4],
    },
    {
      id: "web",
      label: "Web Engineering",
      cmd: "skills.web_dev",
      color: "#34d399",
      skills: t?.webDevelopment ?? config.skills.web_development,
      levels: [5, 4, 5, 5, 4, 4, 4, 4, 4],
    },
    {
      id: "db",
      label: "Databases",
      cmd: "skills.databases",
      color: "#f59e0b",
      skills: t?.databases ?? config.skills.databases,
      levels: [4, 4, 4, 3, 4],
    },
    {
      id: "devops",
      label: "DevOps & Cloud",
      cmd: "skills.devops",
      color: "#60a5fa",
      skills: t?.devOpsCloud ?? config.skills.devops_cloud,
      levels: [4, 4, 3, 4, 4, 3],
    },
    {
      id: "soft",
      label: "Soft Skills",
      cmd: "skills.soft",
      color: "#fb7185",
      skills: t?.softSkills ?? config.skills.soft_skills,
      levels: [5, 5, 5, 5, 5],
    },
  ].filter((s) => s.skills.length > 0);

  const BenchPips = ({ level, color }: { level: number; color: string }) => (
    <div className="bench-track">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bench-pip"
          style={i < level ? { background: color, opacity: 0.85 } : undefined}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="mx-auto w-full max-w-5xl min-w-0 py-6 px-1 sm:px-2"
    >
      {/* Header */}
      <div className="mb-6 px-1">
        <p className="section-kicker">Capability Matrix</p>
        <h2 className="font-display text-safe-balance mt-3 text-3xl font-semibold tracking-tight text-[#e2e8f0] sm:text-4xl">
          Skills & Expertise
        </h2>
        <p className="text-safe-wrap mt-2 text-sm leading-6 text-[#5c7080]">
          Depth per domain — verified by shipped systems and research output.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section, si) => (
          <motion.div
            key={section.id}
            className="console-surface overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut, delay: si * 0.06 }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 border-b border-[#1a2535] bg-[#080c12]/60 px-5 py-2.5">
              <span
                className="font-mono text-[0.65rem] font-semibold tracking-[0.14em] uppercase"
                style={{ color: section.color }}
              >
                &gt;&gt; {section.cmd}
              </span>
              <span className="font-mono text-[0.62rem] text-[#2a3d55]">
                ({section.skills.length} items)
              </span>
            </div>

            {/* Skill rows */}
            <div className="divide-y divide-[#1a2535]">
              {section.skills.map((skill, i) => {
                const level = section.levels[i] ?? 4;
                return (
                  <div
                    key={skill}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-2.5 hover:bg-[#1a2535]/40 transition-colors"
                  >
                    <span className="text-safe-wrap text-sm text-[#c5d5e8]">
                      {skill}
                    </span>
                    <BenchPips level={level} color={section.color} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-5 px-1">
        <span className="font-mono text-[0.6rem] text-[#2a3d55] tracking-wider uppercase">
          Legend
        </span>
        {[
          { label: "Learning", n: 1 },
          { label: "Familiar", n: 2 },
          { label: "Proficient", n: 3 },
          { label: "Advanced", n: 4 },
          { label: "Expert", n: 5 },
        ].map(({ label, n }) => (
          <div key={label} className="flex items-center gap-1.5">
            <BenchPips level={n} color="#00d4aa" />
            <span className="font-mono text-[0.6rem] text-[#2a3d55]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Skills;
