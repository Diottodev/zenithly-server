import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './user.ts';

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    token: text('token').notNull(),
  },
  (table) => [
    index('session_token_unique').on(table.token),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'session_user_fk',
    }),
  ]
);
