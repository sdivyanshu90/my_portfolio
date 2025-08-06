import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";

export const getSkills = tool({
  description:
    "This tool provides a comprehensive overview of technical skills, expertise, and professional qualifications.",
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      technicalSkills: {
        programming: config.skills.programming,
        machineLearning: config.skills.ml_ai,
        webDevelopment: config.skills.web_development,
        databases: config.skills.databases,
        devOpsCloud: config.skills.devops_cloud,
      },
      education: {
        degree: config.education.completed1.degree,
        institution: config.education.completed1.institution,
        cgpa: config.education.completed1.cgpa,
        duration: config.education.completed1.duration,
      },
      achievements: config.education.achievements || [],
      experience: config.experience.map((exp) => ({
        position: exp.position,
        company: exp.company,
        duration: exp.duration,
        type: exp.type,
        technologies: exp.technologies,
        description: exp.description,
      })),
      message:
        "I'd be happy to walk you through my technical skills and expertise. Over time, I've developed a strong and diverse skill set through academic learning and practical experience on real-world projects. My core strengths lie in machine learning and full-stack development, where I’ve built everything from end-to-end web applications to advanced ML models for complex data analysis. Each skill has been reinforced through hands-on problem-solving and continuous learning, ensuring I stay adaptable and innovative. I believe this blend of theoretical knowledge and practical application positions me to make a meaningful impact on your team. Are there any specific technical areas you'd like me to dive deeper into?",
    };
  },
});
