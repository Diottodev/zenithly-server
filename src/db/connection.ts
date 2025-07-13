import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { schema } from '../db/drizzle/index.ts';
import { env } from '../env.ts';

export const sql = postgres(env.DATABASE_URL);
export const db = drizzle(sql, {
  schema,
  casing: 'snake_case',
  logger: true,
});
