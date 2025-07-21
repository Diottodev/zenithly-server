import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('Outlook Calendar Routes', () => {
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
      url: '/v1/api/outlook/calendar/events/list',
      headers: { authorization: 'Bearer fake-token' },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBeDefined();
  });
});
