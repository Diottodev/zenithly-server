import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('Integrations Routes', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it('deve retornar status das integrações', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/api/integrations/status',
      headers: { authorization: 'Bearer fake-token' },
    });
    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body).toHaveProperty('error');
  });
});
