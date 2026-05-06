import {
  ArrowUpRight,
  CalendarRange,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { getConfig } from "@/lib/config-loader";
import type { Project } from "@/types/portfolio";

const defaultProjects = getConfig().projects;

const ProjectContent = ({ project }: { project: Project }) => {
  const projectLinks = project.links.filter((link) => link.url);

  if (!project) return null;

  return (
    <div className="text-card-foreground max-w-4xl min-w-0 space-y-8 p-0">
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <div className="panel-surface px-5 py-4">
          <p className="section-kicker">Category</p>
          <div className="mt-3 flex min-w-0 items-center gap-3 text-[#142132]">
            <FolderKanban className="h-5 w-5 text-[#0b544b]" />
            <span className="text-safe-wrap text-sm font-medium">
              {project.category}
            </span>
          </div>
        </div>

        <div className="panel-surface px-5 py-4">
          <p className="section-kicker">Timeline</p>
          <div className="mt-3 flex min-w-0 items-center gap-3 text-[#142132]">
            <CalendarRange className="h-5 w-5 text-[#0b544b]" />
            <span className="text-safe-wrap text-sm font-medium">
              {project.date}
            </span>
          </div>
        </div>

        <div className="panel-surface px-5 py-4">
          <p className="section-kicker">Delivery State</p>
          <div className="mt-3 flex min-w-0 items-center gap-3 text-[#142132]">
            <Sparkles className="h-5 w-5 text-[#0b544b]" />
            <span className="text-safe-wrap text-sm font-medium">
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <div className="panel-surface px-6 py-6 sm:px-7">
          <p className="section-kicker">Overview</p>
          <p className="text-safe-wrap mt-4 text-sm leading-7 text-[#425062] sm:text-[0.98rem]">
            {project.description}
          </p>
        </div>

        {(project.achievements?.length || project.metrics?.length) && (
          <div className="panel-surface px-6 py-6 sm:px-7">
            <p className="section-kicker">Impact Snapshot</p>

            {project.achievements?.length ? (
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#425062]">
                {project.achievements.slice(0, 3).map((achievement) => (
                  <li key={achievement} className="flex min-w-0 gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0b544b]" />
                    <span className="text-safe-wrap">{achievement}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {!project.achievements?.length && project.metrics?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="text-safe-wrap rounded-full bg-[#eef6f3] px-3 py-1.5 text-xs font-medium text-[#0b544b]"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {project.metrics?.length ? (
        <div className="panel-surface px-6 py-6 sm:px-7">
          <p className="section-kicker">Key Metrics</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {project.metrics.map((metric) => (
              <span
                key={metric}
                className="text-safe-wrap rounded-full border border-[#c9ddd7] bg-[#f2f8f5] px-4 py-2 text-sm font-medium text-[#0b544b]"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {project.techStack.length > 0 && (
        <div className="panel-surface px-6 py-6 sm:px-7">
          <p className="section-kicker">Tech Stack</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-safe-wrap rounded-full border border-[#d7dee7] bg-white/80 px-3 py-1.5 text-sm text-[#233044]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {projectLinks.length > 0 && (
        <div className="panel-surface px-6 py-6 sm:px-7">
          <p className="section-kicker">Links</p>
          <div className="flex flex-wrap gap-3">
            {projectLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[#c9ddd7] bg-[#eef6f3] px-4 py-2 text-sm font-medium text-[#0b544b] transition hover:-translate-y-0.5 hover:bg-[#e2f1ec]"
              >
                <span className="text-safe-wrap">{link.name}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const createProjectData = (projects: Project[] = defaultProjects) =>
  projects.map((project) => ({
    category: project.category,
    title: project.title,
    summary: project.description,
    project,
    content: <ProjectContent project={project} />,
  }));

export const data = createProjectData();
