import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/server";


describe('Gmail Routes', () => {
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
      url: '/v1/api/gmail/send',
      payload: { to: 'test@example.com', subject: 'Teste', text: 'Mensagem' },
      headers: { authorization: 'Bearer fake-token' },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().message || response.json().error).toBeDefined();
  });
});
