import * as v from 'valibot';

export const tutorialProgressSchema = v.object({
  id: v.string(),
  userId: v.string(),
  step: v.string(),
  completed: v.optional(v.boolean(), false),
  completedAt: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
});
export type TutorialProgressSchema = typeof tutorialProgressSchema;
export type TutorialProgress = v.InferOutput<typeof tutorialProgressSchema>;
