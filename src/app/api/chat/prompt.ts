import { systemPrompt } from '@/lib/config-loader';

export const SYSTEM_PROMPT = {
  role: 'system' as const,
  content: systemPrompt
};
