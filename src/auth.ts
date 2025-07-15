import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { db } from './db/connection.ts';
import { schema } from './db/drizzle/index.ts';
import { env } from './env.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
    },
  }),
  plugins: [bearer()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID || '',
      clientSecret: env.GITHUB_CLIENT_SECRET || '',
      redirectURI: `${env.BETTER_AUTH_URL || 'http://localhost:8080'}/api/auth/callback/github`,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      redirectURI: `${env.BETTER_AUTH_URL || 'http://localhost:8080'}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL || 'http://localhost:8080',
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    env.FRONTEND_URL || 'http://localhost:3000',
  ],
});

export type Session = typeof auth.$Infer.Session;
