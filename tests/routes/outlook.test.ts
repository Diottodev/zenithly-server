import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('Outlook Routes', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it('deve retornar erro se integração não existir', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/api/outlook/messages',
      headers: { authorization: 'Bearer fake-token' },
    });
    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBeDefined();
  });
});
