import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";

export const getContact = tool({
  description:
    "This tool provides professional contact information and social media profiles.",
  parameters: z.object({}).passthrough(),
  execute: async () => {
    const config = getConfig();

    return {
      contact: {
        name: config.personal.name,
        email: config.personal.email,
        phone: config.personal.phone,
        location: config.personal.location,
        availability: config.internship.availability,
        portfolio: config.social.portfolio ?? config.personal.website,
        handle: config.personal.handle,
      },
      socialProfiles: {
        github: config.social.github,
        linkedin: config.social.linkedin,
        portfolio: config.social.portfolio ?? config.personal.website ?? "",
      },
      summary:
        "Email is the fastest path for recruiting conversations, with LinkedIn and GitHub available for professional follow-up.",
    };
  },
});
