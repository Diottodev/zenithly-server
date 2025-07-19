import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/drizzle/index.ts';
import { userParamsSchema } from '../schemas/user-routes.schema.ts';

export function googleCalendarRoutes(app: FastifyInstance) {
  // GET /google/calendar/events - Listar eventos do Google Calendar
  app.get<{
    Params: { id: string };
    Querystring: { pageToken?: string; maxResults?: string };
  }>(
    '/google/calendar/events/:id',
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
        if (
          integration.length === 0 ||
          !integration[0]?.googleCalendarAccessToken
        ) {
          return reply
            .status(400)
            .send({ error: 'Integração com Google Calendar não configurada' });
        }
        const accessToken = integration[0].googleCalendarAccessToken;
        // Paginação: pageToken e maxResults
        const { pageToken, maxResults } = request.query;
        const params = new URLSearchParams();
        params.set('maxResults', maxResults ?? '100');
        if (pageToken) {
          params.set('pageToken', pageToken);
        }
        const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`;
        const calendarResponse = await fetch(calendarUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });
        if (!calendarResponse.ok) {
          return reply
            .status(400)
            .send({ error: 'Falha ao acessar Google Calendar' });
        }
        const events = await calendarResponse.json();
        return reply.status(200).send(events);
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );
}
