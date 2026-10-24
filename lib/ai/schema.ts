import { z } from 'zod';

import { getAllSlugs } from '@/lib/catalog';
import { quizRequestSchema } from '@/lib/recommend/schema';

// The quiz answer plus the featured product, all catalog enums. Strict, like the quiz request.
export const quizExplainSchema = quizRequestSchema.extend({
  slug: z.enum(getAllSlugs() as [string, ...string[]]),
});

export type QuizExplainRequest = z.infer<typeof quizExplainSchema>;
