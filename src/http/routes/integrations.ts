import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/drizzle/index.ts';
import { env } from '../../env.ts';
import {
  type UserParams,
  userParamsSchema,
} from '../schemas/user-routes.schema.ts';

export function integrationsRoutes(app: FastifyInstance) {
  // GET /integrations/status - Obter status das integrações do usuário
  app.get<{
    Params: UserParams;
  }>(
    '/integrations/status/:id',
    {
      schema: {
        params: userParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        if (!id) {
          return reply.status(401).send({ error: 'Usuário não autenticado' });
        }
        const integration = await db
          .select()
          .from(schema.userIntegrations)
          .where(eq(schema.userIntegrations.userId, id))
          .limit(1);
        if (integration.length === 0) {
          return reply.send({
            googleCalendar: { enabled: false, connected: false },
            gmail: { enabled: false, connected: false },
            outlook: { enabled: false, connected: false },
          });
        }
        const userIntegration = integration[0];
        return reply.send({
          googleCalendar: {
            enabled: userIntegration.googleCalendarEnabled,
            connected: !!userIntegration.googleCalendarAccessToken,
            tokenExpires: userIntegration.googleCalendarTokenExpiresAt,
          },
          gmail: {
            enabled: userIntegration.gmailEnabled,
            connected: !!userIntegration.gmailAccessToken,
            tokenExpires: userIntegration.gmailTokenExpiresAt,
          },
          outlook: {
            enabled: userIntegration.outlookEnabled,
            connected: !!userIntegration.outlookAccessToken,
            tokenExpires: userIntegration.outlookTokenExpiresAt,
          },
          settings: userIntegration.settings,
        });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // GET /integrations/google/auth-url - Obter URL de autorização do Google
  app.get<{
    Params: UserParams;
  }>(
    '/integrations/google/auth-url/:id',
    {
      schema: {
        params: userParamsSchema,
      },
    },
    (request, reply) => {
      try {
        if (!env.GOOGLE_CLIENT_ID) {
          throw new Error('Credenciais do Google não configuradas');
        }
        const { id } = request.params;
        const scopes = [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/gmail.modify',
          'openid',
          'email',
          'profile',
        ];
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
        authUrl.searchParams.set(
          'redirect_uri',
          `${env.FRONTEND_URL}/integrations/google/callback`
        );
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scopes.join(' '));
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        authUrl.searchParams.set('state', `user_${id}`);
        return reply.send({ authUrl: authUrl.toString() });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // POST /integrations/google/callback - Callback do Google OAuth
  app.post<{
    Body: { code: string; state?: string };
    Params: UserParams;
  }>(
    '/integrations/google/callback/:id',
    {
      schema: {
        body: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
          },
        },
        params: userParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        const { code } = request.body;
        const userId = request.params.id;
        if (!userId) {
          return reply.status(401).send({ error: 'Usuário não autenticado' });
        }
        const hasGoogleCredentials = Boolean(
          env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        );
        if (!hasGoogleCredentials) {
          throw new Error('Credenciais do Google não configuradas');
        }
        // Trocar código por tokens
        const tokenResponse = await fetch(
          'https://oauth2.googleapis.com/token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: env.GOOGLE_CLIENT_ID as string,
              client_secret: env.GOOGLE_CLIENT_SECRET as string,
              code,
              grant_type: 'authorization_code',
              redirect_uri: `${env.FRONTEND_URL}/integrations/google/callback`,
            }),
          }
        );
        if (!tokenResponse.ok) {
          return reply
            .status(400)
            .send({ error: 'Falha na autenticação com Google' });
        }
        const tokens = (await tokenResponse.json()) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        const existingIntegration = await db
          .select()
          .from(schema.userIntegrations)
          .where(eq(schema.userIntegrations.userId, userId))
          .limit(1);
        if (existingIntegration.length === 0) {
          await db.insert(schema.userIntegrations).values({
            id: `integration_${userId}_${Date.now()}`,
            userId,
            googleCalendarEnabled: true,
            googleCalendarAccessToken: tokens.access_token,
            googleCalendarRefreshToken: tokens.refresh_token,
            googleCalendarTokenExpiresAt: expiresAt,
            gmailEnabled: true,
            gmailAccessToken: tokens.access_token,
            gmailRefreshToken: tokens.refresh_token,
            gmailTokenExpiresAt: expiresAt,
          });
        } else {
          await db
            .update(schema.userIntegrations)
            .set({
              googleCalendarEnabled: true,
              googleCalendarAccessToken: tokens.access_token,
              googleCalendarRefreshToken: tokens.refresh_token,
              googleCalendarTokenExpiresAt: expiresAt,
              gmailEnabled: true,
              gmailAccessToken: tokens.access_token,
              gmailRefreshToken: tokens.refresh_token,
              gmailTokenExpiresAt: expiresAt,
              updatedAt: new Date(),
            })
            .where(eq(schema.userIntegrations.userId, userId));
        }
        return reply.send({
          success: true,
          message: 'Integração com Google configurada com sucesso',
          accessToken: tokens.access_token,
        });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // POST /integrations/outlook/callback - Callback do Outlook OAuth
  app.post<{
    Body: { code: string; state?: string };
    Params: UserParams;
  }>(
    '/integrations/outlook/callback/:id',
    {
      schema: {
        body: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
          },
        },
        params: userParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        const { code } = request.body;
        const userId = request.params.id;
        if (!userId) {
          return reply.status(401).send({ error: 'Usuário não autenticado' });
        }
        const hasMicrosoftCredentials = Boolean(
          env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
        );
        if (!hasMicrosoftCredentials) {
          throw new Error('Credenciais do Microsoft não configuradas');
        }
        // Trocar código por tokens
        const tokenResponse = await fetch(
          'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: env.MICROSOFT_CLIENT_ID as string,
              client_secret: env.MICROSOFT_CLIENT_SECRET as string,
              code,
              grant_type: 'authorization_code',
              redirect_uri: `${env.FRONTEND_URL}/integrations/outlook/callback`,
            }),
          }
        );
        if (!tokenResponse.ok) {
          return reply
            .status(400)
            .send({ error: 'Falha na autenticação com Microsoft' });
        }
        const tokens = (await tokenResponse.json()) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        // Salvar tokens no banco
        const existingIntegration = await db
          .select()
          .from(schema.userIntegrations)
          .where(eq(schema.userIntegrations.userId, userId))
          .limit(1);

        if (existingIntegration.length === 0) {
          await db.insert(schema.userIntegrations).values({
            id: `integration_${userId}_${Date.now()}`,
            userId,
            outlookEnabled: true,
            outlookAccessToken: tokens.access_token,
            outlookRefreshToken: tokens.refresh_token,
            outlookTokenExpiresAt: expiresAt,
          });
        } else {
          await db
            .update(schema.userIntegrations)
            .set({
              outlookEnabled: true,
              outlookAccessToken: tokens.access_token,
              outlookRefreshToken: tokens.refresh_token,
              outlookTokenExpiresAt: expiresAt,
              updatedAt: new Date(),
            })
            .where(eq(schema.userIntegrations.userId, userId));
        }
        return reply.send({
          success: true,
          message: 'Integração com Outlook configurada com sucesso',
          accessToken: tokens.access_token,
        });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // GET /integrations/google/tokens - Obter tokens do Google
  app.get<{
    Params: UserParams;
  }>(
    '/integrations/google/tokens/:id',
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
        if (
          integration.length === 0 ||
          !integration[0]?.googleCalendarAccessToken
        ) {
          return reply
            .status(400)
            .send({ error: 'Integração com Google não configurada' });
        }
        const userIntegration = integration[0];
        const now = new Date();
        const tokenExpires = userIntegration.googleCalendarTokenExpiresAt;
        // Verificar se o token está expirado
        if (tokenExpires && tokenExpires <= now) {
          return reply.status(401).send({
            error: 'Token expirado',
            needsRefresh: true,
          });
        }
        return reply.send({
          accessToken: userIntegration.googleCalendarAccessToken,
          tokenType: 'Bearer',
          expiresAt: tokenExpires,
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/gmail.modify',
          ],
        });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // POST /integrations/google/refresh - Refresh token do Google
  app.post<{
    Params: UserParams;
  }>(
    '/integrations/google/refresh/:id',
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
        const hasGoogleCredentials = Boolean(
          env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        );
        if (!hasGoogleCredentials) {
          throw new Error('Credenciais do Google não configuradas');
        }
        const integration = await db
          .select()
          .from(schema.userIntegrations)
          .where(eq(schema.userIntegrations.userId, userId))
          .limit(1);
        if (
          integration.length === 0 ||
          !integration[0]?.googleCalendarRefreshToken
        ) {
          return reply
            .status(400)
            .send({ error: 'Refresh token do Google não encontrado' });
        }
        const refreshToken = integration[0].googleCalendarRefreshToken;
        // Refresh do token
        const tokenResponse = await fetch(
          'https://oauth2.googleapis.com/token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: env.GOOGLE_CLIENT_ID as string,
              client_secret: env.GOOGLE_CLIENT_SECRET as string,
              refresh_token: refreshToken,
              grant_type: 'refresh_token',
            }),
          }
        );
        if (!tokenResponse.ok) {
          return reply
            .status(400)
            .send({ error: 'Falha ao renovar token do Google' });
        }
        const tokens = (await tokenResponse.json()) as {
          access_token: string;
          expires_in: number;
          refresh_token?: string;
        };
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        // Atualizar tokens no banco
        const updateData = {
          googleCalendarAccessToken: tokens.access_token,
          googleCalendarTokenExpiresAt: expiresAt,
          gmailAccessToken: tokens.access_token,
          gmailTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        };
        // Se um novo refresh token foi fornecido, atualizá-lo também
        if (tokens.refresh_token) {
          updateData.googleCalendarAccessToken = tokens.refresh_token;
          updateData.gmailAccessToken = tokens.refresh_token;
        }
        await db
          .update(schema.userIntegrations)
          .set(updateData)
          .where(eq(schema.userIntegrations.userId, userId));
        return reply.send({
          accessToken: tokens.access_token,
          tokenType: 'Bearer',
          expiresAt,
          success: true,
          message: 'Token renovado com sucesso',
        });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // GET /integrations/outlook/tokens - Obter tokens do Outlook
  app.get<{
    Params: UserParams;
  }>(
    '/integrations/outlook/tokens/:id',
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
        const userIntegration = integration[0];
        const now = new Date();
        const tokenExpires = userIntegration.outlookTokenExpiresAt;
        // Verificar se o token está expirado
        if (tokenExpires && tokenExpires <= now) {
          return reply.status(401).send({
            error: 'Token expirado',
            needsRefresh: true,
          });
        }
        return reply.send({
          accessToken: userIntegration.outlookAccessToken,
          tokenType: 'Bearer',
          expiresAt: tokenExpires,
          scopes: [
            'https://graph.microsoft.com/calendars.readwrite',
            'https://graph.microsoft.com/mail.readwrite',
          ],
        });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // POST /integrations/outlook/refresh - Refresh token do Outlook
  app.post<{
    Params: UserParams;
  }>(
    '/integrations/outlook/refresh/:id',
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
        const hasMicrosoftCredentials = Boolean(
          env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
        );
        if (!hasMicrosoftCredentials) {
          throw new Error('Credenciais do Microsoft não configuradas');
        }
        const integration = await db
          .select()
          .from(schema.userIntegrations)
          .where(eq(schema.userIntegrations.userId, userId))
          .limit(1);
        if (integration.length === 0 || !integration[0]?.outlookRefreshToken) {
          return reply
            .status(400)
            .send({ error: 'Refresh token do Outlook não encontrado' });
        }
        const refreshToken = integration[0].outlookRefreshToken;
        // Refresh do token
        const tokenResponse = await fetch(
          'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: env.MICROSOFT_CLIENT_ID as string,
              client_secret: env.MICROSOFT_CLIENT_SECRET as string,
              refresh_token: refreshToken,
              grant_type: 'refresh_token',
            }),
          }
        );
        if (!tokenResponse.ok) {
          return reply
            .status(400)
            .send({ error: 'Falha ao renovar token do Outlook' });
        }
        const tokens = (await tokenResponse.json()) as {
          access_token: string;
          expires_in: number;
          refresh_token?: string;
        };
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        // Atualizar tokens no banco
        const updateData = {
          outlookAccessToken: tokens.access_token,
          outlookTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        };
        await db
          .update(schema.userIntegrations)
          .set(updateData)
          .where(eq(schema.userIntegrations.userId, userId));
        return reply.send({
          accessToken: tokens.access_token,
          tokenType: 'Bearer',
          expiresAt,
          success: true,
          message: 'Token renovado com sucesso',
        });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );

  // GET /integrations/outlook/auth-url - Obter URL de autorização do Outlook
  app.get<{
    Params: UserParams;
  }>(
    '/integrations/outlook/auth-url/:id',
    {
      schema: {
        params: userParamsSchema,
      },
    },
    (request, reply) => {
      try {
        if (!env.MICROSOFT_CLIENT_ID) {
          throw new Error('Credenciais do Microsoft não configuradas');
        }
        const { id } = request.params;
        const scopes = [
          'https://graph.microsoft.com/calendars.readwrite',
          'https://graph.microsoft.com/mail.readwrite',
          'offline_access',
          'openid',
          'profile',
          'email',
        ];
        const authUrl = new URL(
          'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        );
        authUrl.searchParams.set('client_id', env.MICROSOFT_CLIENT_ID);
        authUrl.searchParams.set(
          'redirect_uri',
          `${env.FRONTEND_URL}/integrations/outlook/callback`
        );
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scopes.join(' '));
        authUrl.searchParams.set('response_mode', 'query');
        authUrl.searchParams.set('state', `user_${id}`);
        return reply.send({ authUrl: authUrl.toString() });
      } catch {
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  );
}
