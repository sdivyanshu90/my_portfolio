import type { Project } from "@/types/portfolio";

export function take<T>(values: T[] | undefined, count: number) {
  return (values ?? []).slice(0, count);
}

export function truncateText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function compactProject(project: Project) {
  return {
    title: project.title,
    category: project.category,
    description: truncateText(project.description, 160),
    status: project.status,
    date: project.date,
    featured: project.featured,
    techStack: take(project.techStack, 4),
    metrics: take(project.metrics, 2),
    achievements: take(project.achievements, 2),
    links: take(project.links, 2),
  };
}