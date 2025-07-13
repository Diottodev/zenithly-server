import * as v from 'valibot';
import type { userSchema } from './user.schema.ts';

export const sessionSchema = v.object({
  id: v.string(),
  expiresAt: v.string(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  userId: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  token: v.string(),
});
export type SessionSchema = typeof sessionSchema;
export type Session = v.InferOutput<typeof sessionSchema>;
export type SessionWithUser = Session & {
  user: v.InferOutput<typeof userSchema>;
};
