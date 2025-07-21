import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('Passwords Routes', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it('deve retornar erro ao criar senha sem autenticação', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/api/passwords/create',
      payload: { service: 'test', username: 'user', password: '123' },
    });
    expect(response.statusCode).toBe(500);
  });
});
