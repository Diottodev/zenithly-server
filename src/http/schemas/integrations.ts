import * as v from 'valibot';

export const googleAuthSchema = v.object({
  code: v.pipe(
    v.string(),
    v.minLength(1, 'Código de autorização é obrigatório')
  ),
  state: v.optional(v.string()),
});

export const outlookAuthSchema = v.object({
  code: v.pipe(
    v.string(),
    v.minLength(1, 'Código de autorização é obrigatório')
  ),
  state: v.optional(v.string()),
});

export const integrationToggleSchema = v.object({
  enabled: v.boolean(),
});

export const integrationSettingsSchema = v.object({
  googleCalendar: v.optional(
    v.object({
      enabled: v.boolean(),
      syncFrequency: v.optional(v.string()),
      defaultCalendarId: v.optional(v.string()),
    })
  ),
  gmail: v.optional(
    v.object({
      enabled: v.boolean(),
      autoResponder: v.optional(v.boolean()),
      labels: v.optional(v.array(v.string())),
    })
  ),
  outlook: v.optional(
    v.object({
      enabled: v.boolean(),
      syncFrequency: v.optional(v.string()),
      defaultFolderId: v.optional(v.string()),
    })
  ),
});

export const refreshTokenSchema = v.object({
  service: v.union([
    v.literal('google-calendar'),
    v.literal('gmail'),
    v.literal('outlook'),
  ]),
});

export type TGoogleAuth = v.InferOutput<typeof googleAuthSchema>;
export type TOutlookAuth = v.InferOutput<typeof outlookAuthSchema>;
export type TIntegrationToggle = v.InferOutput<typeof integrationToggleSchema>;
export type TIntegrationSettings = v.InferOutput<
  typeof integrationSettingsSchema
>;
export type TRefreshToken = v.InferOutput<typeof refreshTokenSchema>;
