import { z } from 'zod';

import { routing } from '@/i18n/routing';
import { getQuizOptions } from '@/lib/catalog';

// Enums come from the catalog, so a colour or vibe that no product uses is rejected. Strict:
// unknown keys (free text included) are rejected, not stripped.
const { colors, vibes } = getQuizOptions();
const colorIds = colors.map((color) => color.id) as [string, ...string[]];

export const quizRequestSchema = z.strictObject({
  locale: z.enum(routing.locales),
  color: z.enum(colorIds),
  vibe: vibes.length > 0 ? z.enum(vibes as [string, ...string[]]).optional() : z.undefined(),
});

export type QuizRequest = z.infer<typeof quizRequestSchema>;
