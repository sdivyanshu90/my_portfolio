import { cn } from "@/lib/utils";
import type { Project } from "@/types/portfolio";

const palettes = [
  ["#0f766e", "#14b8a6", "#f97316", "#facc15"],
  ["#1d4ed8", "#38bdf8", "#0f172a", "#94a3b8"],
  ["#7c3aed", "#c084fc", "#ec4899", "#fb7185"],
  ["#14532d", "#22c55e", "#065f46", "#f59e0b"],
  ["#9a3412", "#fb923c", "#7c2d12", "#fef08a"],
  ["#312e81", "#60a5fa", "#0f172a", "#34d399"],
];

function hashString(value: string) {
  let hash = 0;

  for (const char of value) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface ProjectCoverProps {
  project: Project;
  className?: string;
  compact?: boolean;
}

export default function ProjectCover({
  project,
  className,
  compact = false,
}: ProjectCoverProps) {
  const hash = hashString(project.title);
  const palette = palettes[hash % palettes.length];
  const [primary, secondary, depth, glow] = palette;
  const techPreview = project.techStack.slice(0, compact ? 2 : 3);
  const highlight = project.metrics?.[0] ?? project.status;
  const patternId = `project-pattern-${hash}`;
  const gradientId = `project-gradient-${hash}`;
  const initials = getInitials(project.title);

  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-[28px] border border-white/20 text-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]",
        compact ? "min-h-[260px]" : "min-h-[340px]",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={depth} />
            <stop offset="55%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
          <pattern
            id={patternId}
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 63.5H64M63.5 0V64"
              fill="none"
              opacity="0.16"
              stroke="white"
            />
          </pattern>
        </defs>

        <rect width="800" height="520" fill={`url(#${gradientId})`} />
        <rect width="800" height="520" fill={`url(#${patternId})`} />
        <circle cx="645" cy="84" r="120" fill={glow} fillOpacity="0.32" />
        <circle cx="178" cy="410" r="166" fill="white" fillOpacity="0.08" />
        <path
          d="M-40 380C105 272 180 234 292 238C402 242 444 322 560 328C650 332 718 286 840 192V520H-40V380Z"
          fill="white"
          fillOpacity="0.08"
        />
        <path
          d="M58 112H374"
          stroke="white"
          strokeOpacity="0.28"
          strokeWidth="2"
        />
        <path
          d="M58 142H458"
          stroke="white"
          strokeOpacity="0.18"
          strokeWidth="2"
        />
        <path
          d="M58 172H292"
          stroke="white"
          strokeOpacity="0.18"
          strokeWidth="2"
        />
      </svg>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,20,0.12),rgba(7,12,20,0.66))]" />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <span className="text-safe-wrap inline-flex max-w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-white/85 whitespace-normal">
              {project.category}
            </span>
            <span className="text-safe-wrap inline-flex max-w-fit rounded-full border border-white/12 bg-black/10 px-3 py-1 text-xs text-white/70 whitespace-normal">
              {project.date}
            </span>
          </div>

          <div className="max-w-[10rem] shrink-0 rounded-[22px] border border-white/20 bg-white/10 px-4 py-3 text-right shadow-inner shadow-white/5">
            <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {initials}
            </p>
            <p className="text-safe-wrap mt-1 text-[0.68rem] uppercase tracking-[0.24em] text-white/60">
              Signature Build
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {techPreview.map((tech) => (
              <span
                key={tech}
                className="text-safe-wrap rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/78 backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/60">
              Project Narrative
            </p>
            <h3
              className={cn(
                "font-display text-safe-balance max-w-[28rem] font-semibold tracking-tight text-white",
                compact
                  ? "text-[1.8rem] leading-[1.1]"
                  : "text-[2.4rem] leading-[1.02]",
              )}
            >
              {project.title}
            </h3>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="text-safe-wrap rounded-full border border-white/15 bg-black/10 px-3 py-1.5">
              {project.status}
            </span>
            <span className="text-safe-wrap rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90">
              {highlight}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
