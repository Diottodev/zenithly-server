import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './user.ts';

export const passwords = pgTable('passwords', {
  id: uuid('id').primaryKey().defaultRandom(),
  service: text('service').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(), // Encrypted
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
