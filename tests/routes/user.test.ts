import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('User Routes', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it('deve retornar erro ao buscar usuário sem autenticação', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/api/user/get',
    });
    expect(response.statusCode).toBe(500);
  });
});
