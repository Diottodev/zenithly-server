import dotenv from 'dotenv';
import * as v from 'valibot';

dotenv.config();
export const envSchema = v.object({
  PORT: v.pipe(v.string(), v.transform(Number)),
  HOST: v.optional(v.string()),
  CORS_ORIGIN: v.optional(v.string()),
  DATABASE_URL: v.string(),
  JWT_SECRET: v.string(),
  JWT_EXPIRES_IN: v.optional(v.string()),
  JWT_REFRESH_SECRET: v.optional(v.string()),
  JWT_REFRESH_EXPIRES_IN: v.optional(v.string()),
  GITHUB_CLIENT_ID: v.optional(v.string()),
  GITHUB_CLIENT_SECRET: v.optional(v.string()),
  GOOGLE_CLIENT_ID: v.optional(v.string()),
  GOOGLE_CLIENT_SECRET: v.optional(v.string()),
  MICROSOFT_CLIENT_ID: v.optional(v.string()),
  MICROSOFT_CLIENT_SECRET: v.optional(v.string()),
  BETTER_AUTH_SECRET: v.string(),
  BETTER_AUTH_URL: v.optional(v.string()),
  FRONTEND_URL: v.optional(v.string()),
  NODE_ENV: v.optional(
    v.union([
      v.literal('development'),
      v.literal('production'),
      v.literal('test'),
    ])
  ),
});

export const env = v.parse(envSchema, process.env);
export type Env = typeof env;
