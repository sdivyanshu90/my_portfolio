import type { Mode } from "@/lib/protocol";

export const MODE_LABELS: Record<Mode, string> = {
  recruiter: "Recruiter",
  engineer: "Engineer",
  founder: "Founder",
};

/** Preset queries per audience mode — each routes cleanly in the intent router. */
export const PRESETS: Record<Mode, string[]> = {
  recruiter: [
    "Give me the 30-second pitch",
    "Is he available, and for what roles?",
    "Show the experience timeline",
    "What are his credentials?",
    "Where is the résumé?",
  ],
  engineer: [
    "What has he built from scratch?",
    "Show the inference & serving work",
    "How did the 0.00% CER OCR pipeline work?",
    "Show the Yale MPC research",
    "What is his stack?",
  ],
  founder: [
    "What is he doing at Uniiq?",
    "Show shipped systems with measured results",
    "How does he think about evaluation?",
    "What open-source work has he done?",
    "How do I contact him?",
  ],
};
