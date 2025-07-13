import * as v from 'valibot';

export const userSchema = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string(),
  emailVerified: v.optional(v.boolean(), false),
  image: v.optional(v.string()),
  role: v.optional(v.string(), 'user'),
  createdAt: v.string(),
  updatedAt: v.string(),
  hasCompletedOnboarding: v.optional(v.boolean(), false),
  onboardingStep: v.optional(v.string(), 'welcome'),
});
export type UserSchema = typeof userSchema;
export type User = v.InferOutput<typeof userSchema>;
