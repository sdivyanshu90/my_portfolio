import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";

export const getContact = tool({
  description:
    "This tool provides professional contact information and social media profiles.",
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      contact: {
        email: config.personal.email,
        location: config.personal.location,
        availability: config.internship.availability,
      },
      socialProfiles: {
        github: config.social.github,
        linkedin: config.social.linkedin,
        kaggle: config.social.kaggle,
        leetcode: config.social.leetcode,
        codechef: config.social.codechef,
      },
      message:
        "I'd be happy to share my contact details. I'm highly responsive to professional communications and open to connecting with employers and industry professionals. Feel free to reach out via email, LinkedIn, or GitHub—I check them regularly. I'm always open to discussing opportunities, collaborations, or sharing ideas on technology and innovation. What's the best way for your team to stay in touch?",
    };
  },
});
