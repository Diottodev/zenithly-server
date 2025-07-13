import {
  boolean,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './user.ts';

export const userIntegrations = pgTable(
  'userIntegrations',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    googleCalendarEnabled: boolean('googleCalendarEnabled')
      .notNull()
      .default(false),
    googleCalendarAccessToken: text('googleCalendarAccessToken'),
    googleCalendarRefreshToken: text('googleCalendarRefreshToken'),
    googleCalendarTokenExpiresAt: timestamp('googleCalendarTokenExpiresAt'),
    gmailEnabled: boolean('gmailEnabled').notNull().default(false),
    gmailAccessToken: text('gmailAccessToken'),
    gmailRefreshToken: text('gmailRefreshToken'),
    gmailTokenExpiresAt: timestamp('gmailTokenExpiresAt'),
    outlookEnabled: boolean('outlookEnabled').notNull().default(false),
    outlookAccessToken: text('outlookAccessToken'),
    outlookRefreshToken: text('outlookRefreshToken'),
    outlookTokenExpiresAt: timestamp('outlookTokenExpiresAt'),
    settings: jsonb('settings'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'userIntegrations_user_fk',
    }),
    index('userIntegrations_userId_unique').on(table.userId),
  ]
);
