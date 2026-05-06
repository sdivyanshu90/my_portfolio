import { z } from "zod";

const projectImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});

const projectLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().or(z.literal("")),
});

const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  year: z.string().min(1),
  credentialUrl: z.string().url().optional(),
});

const educationEntrySchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  duration: z.string().min(1),
  cgpa: z.string().min(1),
  graduationDate: z.string().min(1),
});

export const portfolioConfigSchema = z.object({
  personal: z.object({
    name: z.string().min(1),
    age: z.number().int().nonnegative(),
    location: z.string().min(1),
    title: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1).optional(),
    website: z.string().url().optional(),
    targetRoles: z.array(z.string().min(1)).default([]),
    handle: z.string().min(1),
    bio: z.string().min(1),
    avatar: z.string().min(1),
    fallbackAvatar: z.string().min(1),
  }),
  education: z.object({
    completed1: educationEntrySchema,
    completed2: educationEntrySchema.optional(),
    achievements: z.array(z.string().min(1)).default([]),
    coursework: z.array(z.string().min(1)).default([]),
  }),
  experience: z.array(
    z.object({
      company: z.string().min(1),
      position: z.string().min(1),
      type: z.string().min(1),
      duration: z.string().min(1),
      description: z.string().min(1),
      technologies: z.array(z.string().min(1)).default([]),
      achievements: z.array(z.string().min(1)).default([]),
    }),
  ),
  skills: z.object({
    programming: z.array(z.string().min(1)).default([]),
    ml_ai: z.array(z.string().min(1)).default([]),
    web_development: z.array(z.string().min(1)).default([]),
    databases: z.array(z.string().min(1)).default([]),
    devops_cloud: z.array(z.string().min(1)).default([]),
    soft_skills: z.array(z.string().min(1)).default([]),
  }),
  projects: z.array(
    z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      description: z.string().min(1),
      techStack: z.array(z.string().min(1)).default([]),
      date: z.string().min(1),
      status: z.string().min(1),
      featured: z.boolean(),
      achievements: z.array(z.string().min(1)).optional(),
      metrics: z.array(z.string().min(1)).optional(),
      links: z.array(projectLinkSchema).default([]),
      images: z.array(projectImageSchema).default([]),
    }),
  ),
  social: z.object({
    codechef: z.string().url().or(z.literal("")),
    linkedin: z.string().url().or(z.literal("")),
    github: z.string().url().or(z.literal("")),
    kaggle: z.string().url().or(z.literal("")),
    leetcode: z.string().url().or(z.literal("")),
    portfolio: z.string().url().optional(),
  }),
  internship: z.object({
    seeking: z.boolean(),
    duration: z.string().min(1),
    startDate: z.string().min(1),
    preferredLocation: z.string().min(1),
    focusAreas: z.array(z.string().min(1)).default([]),
    availability: z.string().min(1),
    workStyle: z.string().min(1),
    goals: z.string().min(1),
  }),
  personality: z.object({
    traits: z.array(z.string().min(1)).default([]),
    interests: z.array(z.string().min(1)).default([]),
    funFacts: z.array(z.string().min(1)).default([]),
    workingStyle: z.string().min(1),
    motivation: z.string().min(1),
  }),
  resume: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    fileType: z.string().min(1),
    lastUpdated: z.string().min(1),
    fileSize: z.string().min(1),
    downloadUrl: z.string().min(1),
    certifications: z.array(certificationSchema).default([]),
  }),
  chatbot: z.object({
    name: z.string().min(1),
    personality: z.string().min(1),
    tone: z.string().min(1),
    language: z.string().min(1),
    responseStyle: z.string().min(1),
    useEmojis: z.boolean(),
    topics: z.array(z.string().min(1)).default([]),
  }),
  presetQuestions: z.object({
    me: z.array(z.string().min(1)).default([]),
    professional: z.array(z.string().min(1)).default([]),
    projects: z.array(z.string().min(1)).default([]),
    contact: z.array(z.string().min(1)).default([]),
    fun: z.array(z.string().min(1)).default([]),
  }),
  meta: z.object({
    configVersion: z.string().min(1),
    lastUpdated: z.string().min(1),
    generatedBy: z.string().min(1),
    description: z.string().min(1),
    siteUrl: z.string().url(),
    ogImage: z.string().min(1),
    googleSiteVerification: z.string().optional(),
  }),
});

export type PortfolioConfigInput = z.infer<typeof portfolioConfigSchema>;
