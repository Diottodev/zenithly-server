import * as v from 'valibot';

export const accountSchema = v.object({
  id: v.string(),
  accountId: v.string(),
  providerId: v.string(),
  userId: v.string(),
  accessToken: v.optional(v.string()),
  refreshToken: v.optional(v.string()),
  idToken: v.optional(v.string()),
  password: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
  accessTokenExpiresAt: v.optional(v.string()),
  refreshTokenExpiresAt: v.optional(v.string()),
  scope: v.optional(v.string()),
});
export type AccountSchema = typeof accountSchema;
export type Account = v.InferOutput<typeof accountSchema>;
