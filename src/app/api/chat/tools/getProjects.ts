import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";
import { compactProject, take } from "./tool-result-utils";

export const getProjects = tool({
  description:
    "This tool showcases a comprehensive project portfolio, highlighting technical achievements and real-world impact.",
  parameters: z.object({}).passthrough(),
  execute: async () => {
    const config = getConfig();

    return {
      featuredProjects: config.projects
        .filter((project) => project.featured)
        .slice(0, 6)
        .map(compactProject),
      projectIndex: take(
        config.projects.map((project) => project.title),
        14,
      ),
      summary:
        "My strongest projects sit at the intersection of applied research, product execution, and systems thinking. The most representative ones combine measurable outcomes, clear technical tradeoffs, and strong end-to-end ownership.",
    };
  },
});
