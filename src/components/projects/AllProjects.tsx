"use client";

import { getConfig } from "@/lib/config-loader";
import type { Project } from "@/types/portfolio";
import { motion, easeOut } from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AllProjectsProps {
  projects?: Project[];
}

const techAccents: Record<string, string> = {
  python:     "#4f46e5",
  pytorch:    "#7c3aed",
  tensorflow: "#7c3aed",
  "next.js":  "#0f172a",
  typescript: "#0284c7",
  react:      "#0ea5e9",
  tailwind:   "#0d9488",
  fastapi:    "#059669",
  docker:     "#0284c7",
  default:    "#64748b",
};

function getTechColor(tech: string): string {
  const key = tech.toLowerCase();
  return Object.entries(techAccents).find(([k]) => key.includes(k))?.[1] ?? techAccents.default;
}

function ArxivCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="arxiv-card overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: easeOut, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
    >
      {/* Colored top accent strip */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${getTechColor(project.techStack?.[0] ?? "")}, ${getTechColor(project.techStack?.[1] ?? "default")})`,
        }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="font-mono text-[0.62rem] text-slate-400 dark:text-slate-500">[{project.date}]</span>
          <span className="text-slate-300 dark:text-slate-600 dark:text-slate-300">·</span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
            {project.category}
          </span>
          {project.status === "Completed" && (
            <>
              <span className="text-slate-300 dark:text-slate-600 dark:text-slate-300">·</span>
              <span className="font-mono text-[0.62rem] text-emerald-600 dark:text-emerald-400">Completed</span>
            </>
          )}
        </div>
        {project.featured && (
          <span className="shrink-0 font-mono text-[0.62rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/25">
            Featured
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-safe-balance text-base font-semibold text-slate-900 dark:text-white px-5 pb-3 leading-6">
        {project.title}
      </h3>

      {/* Tech stack */}
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-3">
          {project.techStack.slice(0, 7).map((tech) => (
            <span
              key={tech}
              className="font-mono text-[0.62rem] rounded-lg px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 dark:text-slate-300 dark:bg-white/5 dark:border-white/10"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-safe-wrap text-sm leading-6 text-slate-600 dark:text-slate-300 px-5 pb-3">
        {project.description}
      </p>

      {/* Achievements */}
      {project.achievements && project.achievements.length > 0 && (
        <div className="px-5 pb-3 space-y-1.5">
          {(expanded ? project.achievements : project.achievements.slice(0, 2)).map((a, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-indigo-500 font-bold text-xs shrink-0 mt-0.5">↑</span>
              <span className="text-safe-wrap text-xs text-slate-500 dark:text-slate-400 leading-5">{a}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer: links + expand */}
      <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-1">
        <div className="flex flex-wrap gap-2">
          {project.links
            ?.filter((l) => l.url)
            .slice(0, 3)
            .map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-indigo-600 border border-indigo-100 bg-indigo-50 rounded-lg px-2.5 py-0.5 hover:bg-indigo-100 transition-colors dark:text-indigo-300 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:hover:bg-indigo-400/20"
              >
                {link.name}
                <ArrowUpRight className="h-2.5 w-2.5" />
              </a>
            ))}
        </div>
        {project.achievements && project.achievements.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 font-mono text-[0.62rem] text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
          >
            {expanded ? (
              <> Less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <> +{project.achievements.length - 2} more <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AllProjects({ projects }: AllProjectsProps) {
  const config = getConfig();
  const allProjects = projects ?? config.projects;

  return (
    <div className="w-full min-w-0 py-6">
      <div className="mb-7 px-1">
        <p className="section-kicker">Research & Engineering</p>
        <h2 className="font-display text-safe-balance mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Selected Work
        </h2>
        <p className="text-safe-wrap mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Systems, ML products, and open-source work with measurable outcomes.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {allProjects.map((project, i) => (
          <ArxivCard key={project.title || i} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
