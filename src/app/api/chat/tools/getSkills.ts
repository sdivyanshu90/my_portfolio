import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";
import { take } from "./tool-result-utils";

export const getSkills = tool({
  description:
    "This tool provides a comprehensive overview of technical skills, expertise, and professional qualifications.",
  parameters: z.object({}).passthrough(),
  execute: async () => {
    const config = getConfig();

    return {
      technicalSkills: {
        programming: take(config.skills.programming, 6),
        machineLearning: take(config.skills.ml_ai, 8),
        webDevelopment: take(config.skills.web_development, 6),
        databases: take(config.skills.databases, 4),
        devOpsCloud: take(config.skills.devops_cloud, 5),
        softSkills: take(config.skills.soft_skills, 5),
      },
      summary:
        "My strongest areas are machine learning systems, LLM applications, and backend-heavy product engineering, with enough frontend depth to ship end-to-end products when needed.",
    };
  },
});
