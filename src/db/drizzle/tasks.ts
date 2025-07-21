import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './user.ts';

export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'pendind',
  'in_progress',
  'review',
  'blocked',
  'done',
  'canceled',
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
