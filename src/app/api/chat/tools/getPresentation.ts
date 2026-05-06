import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";
import { take, truncateText } from "./tool-result-utils";

export const getPresentation = tool({
  description:
    "This tool provides a comprehensive professional introduction and personal background, suitable for interviews and formal presentations.",
  parameters: z.object({}).passthrough(),
  execute: async () => {
    const config = getConfig();

    return {
      presentation: truncateText(config.personal.bio, 320),
      name: config.personal.name,
      title: config.personal.title,
      location: config.personal.location,
      avatar: config.personal.avatar,
      fallbackAvatar: config.personal.fallbackAvatar,
      targetRoles: take(config.personal.targetRoles, 4),
      professionalSummary:
        "I build AI systems and developer products from first principles, then push them toward production quality. My background combines ML research, quantitative modeling, full-stack engineering, and open-source teaching, so I am comfortable moving between theory, systems design, and execution.",
    };
  },
});
