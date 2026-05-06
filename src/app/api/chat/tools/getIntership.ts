import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";
import { take, truncateText } from "./tool-result-utils";

export const getInternship = tool({
  description:
    "Provides comprehensive information about internship opportunities, career preferences, and professional availability for recruiters and HR professionals.",
  parameters: z.object({}).passthrough(),
  execute: async () => {
    const config = getConfig();

    return {
      availability: config.internship.availability,
      preferences: {
        roleTypes: take(config.internship.focusAreas, 4),
        workMode: config.internship.preferredLocation,
        location: config.personal.location,
        startDate: config.internship.startDate,
        duration: config.internship.duration,
      },
      skills: {
        technical: [
          ...take(config.skills.programming, 3),
          ...take(config.skills.ml_ai, 3),
          ...take(config.skills.web_development, 2),
        ],
      },
      achievements: take(config.education.achievements, 3),
      lookingFor: {
        goals: truncateText(config.internship.goals, 160),
        workStyle: config.internship.workStyle,
        growthOpportunities:
          "Roles with strong ownership, technical depth, and room to keep compounding quickly.",
        technicalChallenges:
          "Problems in ML systems, LLM applications, retrieval, privacy-preserving learning, and developer tooling.",
        impactfulWork:
          "Products or research that solve concrete user problems rather than demo-only prototypes.",
        collaboration:
          "Teams that value rigor, fast iteration, and honest technical feedback.",
      },
      contact: {
        email: config.personal.email,
        linkedin: config.social.linkedin,
        github: config.social.github,
        portfolio: config.social.portfolio ?? config.personal.website ?? "",
      },
      summary:
        "I am actively looking for high-bar internships, full-time roles, and contract work where I can contribute quickly on serious AI systems and developer products.",
    };
  },
});
