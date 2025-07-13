import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
    role: text('role').notNull().default('user'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    hasCompletedOnboarding: boolean('hasCompletedOnboarding')
      .notNull()
      .default(false),
    onboardingStep: text('onboardingStep').default('welcome'),
  },
  (table) => [index('user_email_unique').on(table.email)]
);
