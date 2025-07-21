import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('Tasks Routes', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it('deve retornar erro ao criar task sem autenticação', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/api/tasks/create',
      payload: { title: 'Task', description: 'Desc', status: 'todo' },
    });
    expect(response.statusCode).toBe(500);
  });
});
