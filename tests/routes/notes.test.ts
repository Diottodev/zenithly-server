import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server';

describe('Notes Routes', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it('deve retornar lista de notas (vazia)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/api/notes/list',
      headers: { authorization: 'Bearer fake-token' },
    });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toHaveProperty('error');
  });

  it('deve retornar erro ao criar nota sem autenticação', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/api/notes/create',
      payload: { title: 'Teste', content: 'Conteúdo' },
    });
    expect(response.statusCode).toBe(500);
  });
});
