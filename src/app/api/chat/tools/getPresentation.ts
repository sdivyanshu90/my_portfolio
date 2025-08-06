import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";

export const getPresentation = tool({
  description:
    "This tool provides a comprehensive professional introduction and personal background, suitable for interviews and formal presentations.",
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      presentation: config.personal.bio,
      name: config.personal.name,
      title: config.personal.title,
      age: config.personal.age,
      location: config.personal.location,
      education: config.education.completed1,
      traits: config.personality.traits,
      interests: config.personality.interests,
      motivation: config.personality.motivation,
      professionalSummary:
        "I'm a passionate software developer driven by curiosity and a commitment to building innovative, real-world solutions. My journey in technology combines a solid theoretical foundation with hands-on experience from internships, freelance projects, and open-source contributions. I thrive on solving complex challenges that require both creativity and technical precision, and I excel in collaborative environments where ideas turn into impactful products. My ultimate goal is to work on groundbreaking projects that leverage AI, machine learning, and modern development practices to create meaningful change. I'm excited about the opportunity to bring my expertise, adaptability, and enthusiasm to your team.",
    };
  },
});
