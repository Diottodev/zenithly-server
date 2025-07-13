import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';

export default defineConfig({
  schema: './src/db/drizzle/**.ts',
  dialect: 'postgresql',
  casing: 'snake_case',
  out: './src/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
