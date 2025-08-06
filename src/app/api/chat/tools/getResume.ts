import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";

export const getResume = tool({
  description:
    "This tool provides comprehensive resume information including professional experience, education, and achievements.",
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      personalInfo: {
        name: config.personal.name,
        email: config.personal.email,
        location: config.personal.location,
        title: config.personal.title,
        profiles: {
          github: config.social.github,
          linkedin: config.social.linkedin,
          kaggle: config.social.kaggle,
          leetcode: config.social.leetcode,
          codechef: config.social.codechef,
        },
      },
      summary: config.personal.bio,
      education: {
        completed1: config.education.completed1,
        completed2: config.education.completed2,
        achievements: config.education.achievements,
      },
      experience: config.experience.map((exp) => ({
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        type: exp.type,
        description: exp.description,
        technologies: exp.technologies,
      })),
      skills: config.skills,
      resume: {
        title: config.resume.title,
        description: config.resume.description,
        lastUpdated: config.resume.lastUpdated,
        downloadUrl: config.resume.downloadUrl,
      },
      message:
        "I'm pleased to share my professional background with you. My journey has been driven by a strong commitment to blending academic excellence with real-world application. I've consistently sought opportunities to translate theoretical knowledge into practical solutions through projects and internships. This combination of academic rigor and hands-on experience has given me a solid foundation in both problem-solving and implementation. I believe these experiences have equipped me to make meaningful contributions to your organization. I'd be happy to elaborate on any specific aspect of my background that interests you.",
    };
  },
});
