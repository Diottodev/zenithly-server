import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { schema } from '../..//db/drizzle/index.ts';
import { userParamsSchema } from '../schemas/user-routes.schema.ts';

export function outlookCalendarRoutes(app: FastifyInstance) {
  // GET /outlook/calendar/events - Listar eventos do Outlook Calendar
  app.get<{
    Params: { id: string };
  }>(
    '/outlook/calendar/events/:id',
    {
      schema: {
        params: userParamsSchema,
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
        if (integration.length === 0 || !integration[0]?.outlookAccessToken) {
          return reply
            .status(400)
            .send({ error: 'Integração com Outlook não configurada' });
        }
        const accessToken = integration[0].outlookAccessToken;
        // Fazer requisição para API do Outlook Calendar
        const calendarResponse = await fetch(
          'https://graph.microsoft.com/v1.0/me/events',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );
        if (!calendarResponse.ok) {
          return reply
            .status(400)
            .send({ error: 'Falha ao acessar Outlook Calendar' });
        }
        const events = await calendarResponse.json();
        return reply.status(200).send(events);
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );
}
