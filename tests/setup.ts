import dotenv from 'dotenv';
import type { InferSelectModel } from 'drizzle-orm';
import { vi } from 'vitest';
import type { notes } from '../src/db/drizzle/notes.ts';
import type { passwords } from '../src/db/drizzle/passwords.ts';
import type { tasks } from '../src/db/drizzle/tasks.ts';

// Setup global test environment
dotenv.config({ path: '.env.test' });

// Mock Better Auth
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    handler: vi.fn(async (req) => {
      const url = new URL(req.url);
      if (url.pathname.endsWith('/login')) {
        const body = await req.json();
        if (
          body.email === 'test@example.com' &&
          body.password === 'password123'
        ) {
          return new Response(JSON.stringify({ token: 'mock-auth-token' }), {
            status: 200,
          });
        }
        return new Response(null, { status: 401 });
      }
      return new Response(null, { status: 404 });
    }),
    api: {
      getSession: vi.fn(({ headers }) => {
        const token = headers.get('authorization')?.replace('Bearer ', '');
        if (token === 'mock-auth-token') {
          return Promise.resolve({
            user: {
              id: 'mock-user-id',
              name: 'Test User',
              email: 'test@example.com',
            },
            session: {
              token: 'mock-session-token',
              expiresAt: new Date(Date.now() + 3600 * 1000),
            },
          });
        }
        return Promise.resolve(null);
      }),
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

// Mock Drizzle ORM db connection
vi.mock('../src/db/connection.ts', () => {
  const mockNotes: InferSelectModel<typeof notes>[] = [
    {
      id: 'mock-note-id',
      userId: 'mock-user-id',
      title: 'Existing Note',
      content: 'This is an existing mock note',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const mockPasswords: InferSelectModel<typeof passwords>[] = [
    {
      id: 'mock-password-id',
      userId: 'mock-user-id',
      service: 'Existing Service',
      username: 'existing_username',
      password: 'hashed_existing_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const mockTasks: InferSelectModel<typeof tasks>[] = [
    {
      id: 'mock-task-id',
      userId: 'mock-user-id',
      title: 'Existing Task',
      description: 'This is an existing mock task',
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  function updateMockItem<T extends { id: string }>(
    id: string,
    data: Partial<T>,
    mockArray: T[]
  ): T | undefined {
    const index = mockArray.findIndex((item) => item.id === id);
    if (index !== -1) {
      mockArray[index] = { ...mockArray[index], ...data };
      return mockArray[index];
    }
  }

  function deleteMockItem<T extends { id: string }>(
    id: string,
    mockArray: T[]
  ): T | undefined {
    const index = mockArray.findIndex((item) => item.id === id);
    if (index !== -1) {
      return mockArray.splice(index, 1)[0];
    }
  }

  function parseDrizzleCondition(
    condition: unknown
  ): { field: string; value: unknown } | null {
    if (
      typeof condition === 'object' &&
      condition !== null &&
      'type' in condition &&
      (condition as { type: string }).type === 'eq' &&
      'right' in condition &&
      typeof (condition as { right: { value: unknown } }).right === 'object' &&
      (condition as { right: { value: unknown } }).right !== null &&
      'value' in (condition as { right: { value: unknown } }).right
    ) {
      const left = (
        condition as unknown as { left: { field: { name: string } } }
      ).left;
      const right = (condition as { right: { value: unknown } }).right;
      return { field: left.field.name, value: right.value };
    }
    // Adicione mais tipos de condição conforme necessário (e.g., and, or, gt, lt)
    return null;
  }

  return {
    db: {
      query: {
        userIntegrations: {
          findFirst: vi.fn((condition) => {
            const userId = condition.where.value;
            // Retorna uma integração mockada combinada para simplificar os testes
            if (userId === 'mock-user-id') {
              return {
                id: 'mock-integration-id-combined',
                userId: 'mock-user-id',
                gmailEnabled: true,
                gmailAccessToken: 'mock_access_token_gmail',
                gmailRefreshToken: 'mock_refresh_token_gmail',
                gmailTokenExpiresAt: new Date(),
                googleCalendarEnabled: true,
                googleCalendarAccessToken: 'mock_access_token',
                googleCalendarRefreshToken: 'mock_refresh_token',
                googleCalendarTokenExpiresAt: new Date(),
              };
            }
            return null;
          }),
        },
      },
      select: vi.fn(() => ({
        from: vi.fn((table) => ({
          where: vi.fn((condition) => ({
            execute: vi.fn(() => {
              const parsedCondition = parseDrizzleCondition(condition);
              let data: unknown[] = [];

              if (table.tableName === 'notes') {
                data = mockNotes;
              } else if (table.tableName === 'passwords') {
                data = mockPasswords;
              } else if (table.tableName === 'tasks') {
                data = mockTasks;
              }

              if (parsedCondition) {
                return data.filter(
                  (item) =>
                    item?.[parsedCondition.field] === parsedCondition.value
                );
              }
              return data;
            }),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn((data) => ({
          returning: vi.fn(() => {
            const newId = `mock-${Math.random().toString(36).substring(7)}`;
            const newData = { id: newId, ...data };
            if ('title' in newData && 'content' in newData) {
              mockNotes.push(newData as InferSelectModel<typeof notes>);
            } else if ('service' in newData && 'username' in newData) {
              mockPasswords.push(newData as InferSelectModel<typeof passwords>);
            } else if ('title' in newData && 'status' in newData) {
              mockTasks.push(newData as InferSelectModel<typeof tasks>);
            }
            return [newData];
          }),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn((data) => ({
          where: vi.fn((condition) => ({
            returning: vi.fn(() => {
              const parsedCondition = parseDrizzleCondition(condition);
              const id = parsedCondition?.value as string;
              let updatedItem:
                | InferSelectModel<typeof notes>
                | InferSelectModel<typeof passwords>
                | InferSelectModel<typeof tasks>
                | undefined;

              if (id) {
                if ('title' in data && 'content' in data) {
                  updatedItem = updateMockItem(id, data, mockNotes);
                } else if ('service' in data && 'username' in data) {
                  updatedItem = updateMockItem(id, data, mockPasswords);
                } else if ('title' in data && 'status' in data) {
                  updatedItem = updateMockItem(id, data, mockTasks);
                }
              }
              return [updatedItem];
            }),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn((condition) => ({
          returning: vi.fn(() => {
            const parsedCondition = parseDrizzleCondition(condition);
            const id = parsedCondition?.value as string;
            const deletedItem =
              deleteMockItem(id, mockNotes) ||
              deleteMockItem(id, mockPasswords) ||
              deleteMockItem(id, mockTasks);
            return [deletedItem];
          }),
        })),
      })),
      execute: vi.fn(() => Promise.resolve()),
    },
  };
});
