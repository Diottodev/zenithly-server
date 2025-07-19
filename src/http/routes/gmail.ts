import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/drizzle/index.ts';
import { userParamsSchema } from '../schemas/user-routes.schema.ts';

export function gmailRoutes(app: FastifyInstance) {
  // GET /google/gmail/messages - Listar mensagens do Gmail
  app.get<{
    Params: { id: string };
    Querystring: { pageToken?: string; maxResults?: string };
  }>(
    '/google/gmail/messages/:id',
    {
      schema: {
        params: userParamsSchema,
        querystring: {
          type: 'object',
          properties: {
            pageToken: { type: 'string' },
            maxResults: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.params.id;
        if (!userId) {
          return reply.status(401).send({ error: 'Usuário não autenticado' });
        }
        const integration = await db
          .select()
          .from(schema.userIntegrations)
          .where(eq(schema.userIntegrations.userId, userId))
          .limit(1);
        if (integration.length === 0 || !integration[0]?.gmailAccessToken) {
          return reply
            .status(400)
            .send({ error: 'Integração com Gmail não configurada' });
        }
        const accessToken = integration[0].gmailAccessToken;
        const { pageToken, maxResults } = request.query;
        const params = new URLSearchParams();
        params.set('maxResults', maxResults ?? '100');
        if (pageToken) {
          params.set('pageToken', pageToken);
        }
        const gmailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`;
        const gmailResponse = await fetch(gmailUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });
        if (!gmailResponse.ok) {
          return reply.status(400).send({ error: 'Falha ao acessar Gmail' });
        }
        const messages = await gmailResponse.json();
        return reply.status(200).send(messages);
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );
}
