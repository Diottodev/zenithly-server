import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('Google Calendar Routes', () => {
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
      method: 'POST',
      url: '/v1/api/google-calendar/event',
      payload: { summary: 'Evento', start: new Date(), end: new Date() },
      headers: { authorization: 'Bearer fake-token' },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().message || response.json().error).toBeDefined();
  });
});
