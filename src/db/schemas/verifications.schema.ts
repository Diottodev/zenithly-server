import * as v from 'valibot';

export const verificationSchema = v.object({
  id: v.string(),
  identifier: v.string(),
  value: v.string(),
  expiresAt: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
});
export type VerificationSchema = typeof verificationSchema;
export type Verification = v.InferOutput<typeof verificationSchema>;
