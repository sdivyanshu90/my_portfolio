import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";

export const getProjects = tool({
  description:
    "This tool showcases a comprehensive project portfolio, highlighting technical achievements and real-world impact.",
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      projects: config.projects.map((project) => ({
        title: project.title,
        type: project.category,
        date: project.date,
        description: project.description,
        techStack: project.techStack,
        status: project.status,
        featured: project.featured,
        links: project.links,
        highlights: project.achievements || project.metrics || [],
      })),
      summary:
        "I'm excited to share my project portfolio, which reflects my growth as a developer and my ability to turn ideas into fully deployed solutions. Each project has taught me valuable lessons—from technical implementation to project management and problem-solving. Working across diverse technology stacks and domains has given me a broad perspective on software development. What I'm most proud of is how these projects have solved real-world challenges while fueling my continuous learning. I'd be happy to dive deeper into any project that interests you or explore how my experience can add value to your organization.",
    };
  },
});
