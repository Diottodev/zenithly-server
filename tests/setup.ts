import { vi } from 'vitest';

// Setup global test environment
vi.mock('../src/env.ts', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    JWT_SECRET: 'test-jwt-secret',
    BETTER_AUTH_URL: 'http://localhost:3333',
    BETTER_AUTH_SECRET: 'test-auth-secret',
  },
}));

// Mock Better Auth
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      signInSocial: vi.fn(),
    },
  })),
}));
