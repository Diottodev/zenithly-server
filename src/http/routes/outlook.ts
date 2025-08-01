import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/drizzle/index.ts';

export function outlookRoutes(app: FastifyInstance) {
  // GET /outlook/messages - Listar mensagens do Outlook
  app.get<{
    Querystring: { pageToken?: string; maxResults?: string };
  }>(
    '/messages',
    {
      schema: {
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
        const userId = (request as { user: { sub: string } }).user.sub;
        if (!userId) {
          return reply.status(401).send({ error: 'Usuário não autenticado' });
        }
        const integration = await db
          .select()
          .from(schema.userIntegrations)
          .where(eq(schema.userIntegrations.userId, userId))
          .limit(1);
        if (integration.length === 0 || !integration[0]?.outlookAccessToken) {
          return reply
            .status(400)
            .send({ error: 'Integração com Outlook não configurada' });
        }
        const accessToken = integration[0].outlookAccessToken;
        const { pageToken, maxResults } = request.query;
        const params = new URLSearchParams();
        params.set('maxResults', maxResults ?? '100');
        if (pageToken) {
          params.set('pageToken', pageToken);
        }
        const outlookUrl = `https://graph.microsoft.com/v1.0/me/messages?${params.toString()}`;
        const outlookResponse = await fetch(outlookUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });
        if (!outlookResponse.ok) {
          return reply.status(400).send({ error: 'Falha ao acessar Outlook' });
        }
        const messages = await outlookResponse.json();
        return reply.status(200).send(messages);
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );
}
