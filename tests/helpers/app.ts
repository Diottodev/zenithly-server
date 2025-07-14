import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll } from 'vitest';
import { createApp } from '../../src/server.ts';

let app: FastifyInstance;

export const setupTestApp = () => {
  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  return app;
};

export const getTestApp = () => app;
