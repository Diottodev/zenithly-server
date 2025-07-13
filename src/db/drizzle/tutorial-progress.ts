import {
  boolean,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './user.ts';

export const tutorialProgress = pgTable(
  'tutorialProgress',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    step: text('step').notNull(),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'tutorialProgress_user_fk',
      columns: [table.userId],
      foreignColumns: [user.id],
    }),
    index('tutorialProgress_userId_step_unique').on(table.userId, table.step),
  ]
);
