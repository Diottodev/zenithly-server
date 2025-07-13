import * as v from 'valibot';

export const userIntegrationsSchema = v.object({
  id: v.string(),
  userId: v.string(),
  googleCalendarEnabled: v.optional(v.boolean(), false),
  googleCalendarAccessToken: v.optional(v.string()),
  googleCalendarRefreshToken: v.optional(v.string()),
  googleCalendarTokenExpiresAt: v.optional(v.string()),
  gmailEnabled: v.optional(v.boolean(), false),
  gmailAccessToken: v.optional(v.string()),
  gmailRefreshToken: v.optional(v.string()),
  gmailTokenExpiresAt: v.optional(v.string()),
  outlookEnabled: v.optional(v.boolean(), false),
  outlookAccessToken: v.optional(v.string()),
  outlookRefreshToken: v.optional(v.string()),
  outlookTokenExpiresAt: v.optional(v.string()),
  settings: v.optional(v.record(v.string(), v.unknown())),
  createdAt: v.string(),
  updatedAt: v.string(),
});
export type UserIntegrationsSchema = typeof userIntegrationsSchema;
export type UserIntegrations = v.InferOutput<typeof userIntegrationsSchema>;
