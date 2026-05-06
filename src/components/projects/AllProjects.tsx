"use client";

import { getConfig } from "@/lib/config-loader";
import type { Project } from "@/types/portfolio";
import { motion, easeOut } from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AllProjectsProps {
  projects?: Project[];
}

function ArxivCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const stackColors: Record<string, string> = {
    Python: "#00d4aa",
    PyTorch: "#a78bfa",
    TensorFlow: "#a78bfa",
    "Next.js": "#60a5fa",
    TypeScript: "#60a5fa",
    React: "#60a5fa",
    "Tailwind CSS": "#34d399",
    default: "#5c7080",
  };

  const getColor = (tech: string) =>
    Object.entries(stackColors).find(([k]) =>
      tech.toLowerCase().includes(k.toLowerCase()),
    )?.[1] ?? stackColors.default;

  return (
    <motion.div
      className="arxiv-card overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut, delay: index * 0.05 }}
    >
      {/* Card Header Row */}
      <div className="flex items-start justify-between gap-4 border-b border-[#1a2535] bg-[#080c12]/50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <span className="font-mono text-[0.62rem] text-[#5c7080]">
            [{project.date}]
          </span>
          <span className="font-mono text-[0.62rem] text-[#2a3d55]">·</span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#5c7080]">
            {project.category}
          </span>
          {project.status === "Completed" && (
            <>
              <span className="font-mono text-[0.62rem] text-[#2a3d55]">·</span>
              <span className="font-mono text-[0.62rem] text-[#00d4aa] opacity-70">
                COMPLETED
              </span>
            </>
          )}
        </div>
        {project.featured && (
          <span className="shrink-0 font-mono text-[0.62rem] font-semibold tracking-[0.12em] border border-[#f59e0b]/35 text-[#f59e0b] px-2 py-0.5 rounded">
            FEATURED
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Title */}
        <h3 className="font-display text-safe-balance text-base font-semibold text-[#e2e8f0] leading-6 sm:text-lg">
          {project.title}
        </h3>

        {/* Tech stack tokens */}
        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 8).map((tech) => (
              <span
                key={tech}
                className="font-mono text-[0.62rem] rounded px-1.5 py-0.5 bg-[#141d2b] border border-[#1a2535]"
                style={{ color: getColor(tech) }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-safe-wrap text-sm leading-6 text-[#5c7080]">
          {project.description}
        </p>

        {/* Key achievements (collapsed by default, show 2 inline) */}
        {project.achievements && project.achievements.length > 0 && (
          <div className="space-y-1.5">
            {(expanded
              ? project.achievements
              : project.achievements.slice(0, 2)
            ).map((achievement, i) => (
              <div key={i} className="flex gap-2 items-start min-w-0">
                <span className="font-mono text-[#00d4aa] text-xs shrink-0 mt-0.5 opacity-70">
                  ↑
                </span>
                <span className="text-safe-wrap text-xs text-[#8b9db5] leading-5">
                  {achievement}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expand / collapse + links */}
        <div className="flex items-center justify-between gap-3 pt-1">
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
                  className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-[#00d4aa] border border-[#00d4aa]/20 rounded px-2 py-0.5 hover:border-[#00d4aa]/50 hover:bg-[#00d4aa]/6 transition-all"
                >
                  {link.name}
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
              ))}
          </div>

          {project.achievements && project.achievements.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 font-mono text-[0.62rem] text-[#2a3d55] hover:text-[#5c7080] transition-colors"
            >
              {expanded ? (
                <>
                  collapse <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  +{project.achievements.length - 2} more{" "}
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AllProjects({ projects }: AllProjectsProps) {
  const config = getConfig();
  const allProjects = projects ?? config.projects;

  return (
    <div className="w-full min-w-0 py-6">
      <div className="mb-6 px-1">
        <p className="section-kicker">Research & Engineering</p>
        <h2 className="font-display text-safe-balance mt-3 text-3xl font-semibold tracking-tight text-[#e2e8f0] sm:text-4xl">
          Selected Work
        </h2>
        <p className="text-safe-wrap mt-2 max-w-2xl text-sm leading-6 text-[#5c7080]">
          Systems, ML products, and open-source work with measurable outcomes.
          Each entry is a structured case study.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        {allProjects.map((project, i) => (
          <ArxivCard key={project.title || i} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}


