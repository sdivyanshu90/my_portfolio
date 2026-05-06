import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";
import { take, truncateText } from "./tool-result-utils";

export const getResume = tool({
  description:
    "This tool provides comprehensive resume information including professional experience, education, and achievements.",
  parameters: z.object({}).passthrough(),
  execute: async () => {
    const config = getConfig();

    return {
      personalInfo: {
        targetRoles: take(config.personal.targetRoles, 4),
      },
      education: {
        coursework: take(config.education.coursework, 3),
      },
      experience: take(config.experience, 2).map((exp) => ({
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
      })),
      resume: {
        title: config.resume.title,
        description: truncateText(config.resume.description, 140),
        fileType: config.resume.fileType,
        lastUpdated: config.resume.lastUpdated,
        fileSize: config.resume.fileSize,
        downloadUrl: config.resume.downloadUrl,
        certifications: take(config.resume.certifications, 3),
      },
      summary:
        "My resume reflects a mix of applied ML research, quantitative experimentation, and production-oriented software engineering, with emphasis on shipping real systems rather than demo-only work.",
    };
  },
});
