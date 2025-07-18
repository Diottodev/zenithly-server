/** biome-ignore-all lint/suspicious/noConsole: any */

import type { FastifyInstance } from 'fastify';
import { env } from '../../env.ts';
import { extractSessionToken } from '../../utils/extract-session-token.ts';
import { handleAuthError } from '../handlers/handle-error-auth.ts';
import {
  createUserSchema,
  type Login,
  loginSchema,
} from '../schemas/user-routes.schema.ts';
import type { THandleError } from '../types/handle-error-login.ts';

export function authRoutes(app: FastifyInstance) {
  // POST /auth/login - Login with email and password using better-auth
  app.post<{
    Body: Login;
  }>(
    '/auth/login',
    {
      schema: {
        body: loginSchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      if (!(email && password)) {
        return reply.code(400).send({
          error: 'Dados inválidos',
          message: 'Email e senha são obrigatórios',
        });
      }
      try {
        const signInResult = await app.betterAuth.api.signInEmail({
          body: {
            email,
            password,
          },
        });
        if (!signInResult?.user) {
          return reply.code(401).send({
            error: 'Credenciais inválidas',
            message: 'Email ou senha incorretos',
          });
        }
        return reply.code(200).send({
          message: 'Login realizado com sucesso',
          user: signInResult.user,
          token: signInResult.token,
        });
      } catch (error) {
        app.log.error(error, 'Erro no login');
        return handleAuthError(error as THandleError, reply);
      }
    }
  );

  // POST /auth/logout - Logout using better-auth
  app.post('/auth/logout', async (request, reply) => {
    try {
      const sessionToken = request.headers.authorization?.replace(
        'Bearer ',
        ''
      );
      if (sessionToken) {
        await app.betterAuth.api.signOut({
          headers: new Headers({
            authorization: `Bearer ${sessionToken}`,
          }),
        });
      }
      return reply.code(200).send({
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      app.log.error(error, 'Erro no logout');
      return reply.code(500).send({
        error: 'Erro interno do servidor',
        message: 'Não foi possível realizar o logout',
      });
    }
  });

  // GET /auth/session - Verify current session using better-auth
  app.get('/auth/session', async (request, reply) => {
    try {
      const sessionToken = request.headers.authorization?.replace(
        'Bearer ',
        ''
      );
      const sessionTokenFromCookie = extractSessionToken({
        cookie: request.headers.cookie,
      });
      const token = sessionToken
        ? sessionToken
        : sessionTokenFromCookie || undefined;
      if (!token) {
        return reply.code(401).send({
          error: 'Não autenticado',
          message: 'Token de sessão não fornecido',
        });
      }
      const sessionData = await app.betterAuth.api.getSession({
        headers: new Headers({
          ...(sessionToken
            ? {
                authorization: `Bearer ${sessionToken}`,
              }
            : {}),
          ...(sessionTokenFromCookie
            ? {
                cookie: `better-auth.session_token=${sessionTokenFromCookie}`,
              }
            : {}),
        }),
      });
      if (!sessionData?.user) {
        return reply.code(401).send({
          error: 'Não autenticado',
          message: 'Sessão inválida ou expirada',
        });
      }
      return reply.code(200).send({
        user: sessionData.user,
        session: sessionData.session,
      });
    } catch (error) {
      app.log.error(error, 'Erro ao verificar sessão');
      return reply.code(401).send({
        error: 'Não autenticado',
        message: 'Token inválido ou expirado',
      });
    }
  });

  // POST /auth/register - Register with email and password using better-auth
  app.post<{
    Body: Login & { name: string };
  }>(
    '/auth/register',
    {
      schema: {
        body: createUserSchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;
      try {
        const signUpResult = await app.betterAuth.api.signUpEmail({
          body: {
            name,
            email,
            password,
          },
        });
        if (!signUpResult?.user) {
          return reply.code(400).send({
            error: 'Erro no registro',
            message: 'Não foi possível criar a conta',
          });
        }
        return reply.code(201).send({
          message: 'Conta criada com sucesso',
          user: signUpResult.user,
        });
      } catch (error) {
        app.log.error(error, 'Erro no registro');
        return handleAuthError(error as THandleError, reply);
      }
    }
  );

  // GET /auth/github - GitHub OAuth login
  app.get('/auth/github', async (_request, reply) => {
    try {
      const githubResult = await app.betterAuth.api.signInSocial({
        body: {
          provider: 'github',
          callbackURL: `${env.BETTER_AUTH_URL}/auth/callback`,
        },
      });
      if (!githubResult?.url) {
        return reply.code(500).send({
          error: 'Erro na autenticação',
          message: 'Não foi possível iniciar login com GitHub',
        });
      }
      return reply.redirect(githubResult.url);
    } catch (error) {
      app.log.error(error, 'Erro no login GitHub');
      return reply.code(500).send({
        error: 'Erro interno do servidor',
        message: 'Não foi possível realizar login com GitHub',
      });
    }
  });

  // GET /auth/google - Google OAuth login
  app.get('/auth/google', async (_request, reply) => {
    try {
      const googleResult = await app.betterAuth.api.signInSocial({
        body: {
          provider: 'google',
          callbackURL: `${env.BETTER_AUTH_URL}/auth/callback`,
        },
      });
      if (!googleResult?.url) {
        return reply.code(500).send({
          error: 'Erro na autenticação',
          message: 'Não foi possível iniciar login com Google',
        });
      }
      return reply.redirect(googleResult.url);
    } catch (error) {
      app.log.error(error, 'Erro no login Google');
      return reply.code(500).send({
        error: 'Erro interno do servidor',
        message: 'Não foi possível realizar login com Google',
      });
    }
  });

  // GET /auth/callback - Callback de sucesso do OAuth
  app.get('/auth/callback', async (request, reply) => {
    try {
      const sessionToken = extractSessionToken({
        cookie: request.headers.cookie,
      });
      if (!sessionToken) {
        return reply.code(400).send({
          error: 'Token não fornecido',
          message: 'Token de autenticação não encontrado',
        });
      }
      const sessionData = await app.betterAuth.api.getSession({
        headers: new Headers({
          authorization: `Bearer ${sessionToken}`,
          cookie: `better-auth.session_token=${sessionToken}`,
        }),
      });
      console.log(`Dados da sessão: ${JSON.stringify(sessionData)}`);
      // Verifica se o usuário está autenticado
      console.log('Verificando se o usuário está autenticado');
      if (sessionData?.user) {
        const frontendURL = env.FRONTEND_URL || 'http://localhost:3000';
        return reply.redirect(
          `${frontendURL}/auth/callback?success=true&token=${sessionData.session.token}`
        );
      }

      const frontendURL = env.FRONTEND_URL || 'http://localhost:3000';
      app.log.warn('Sessão inválida ou não encontrada');
      return reply.redirect(
        `${frontendURL}/auth/callback?error=invalid_session`
      );
    } catch (error) {
      app.log.error(error, 'Erro no callback de sucesso');
      const frontendURL = env.FRONTEND_URL || 'http://localhost:3000';
      return reply.redirect(`${frontendURL}/auth/callback?error=server_error`);
    }
  });

  // GET /auth/callback/error - Callback de erro do OAuth
  app.get<{
    Querystring: { error?: string };
  }>('/auth/callback/error', (request, reply) => {
    const error = request.query.error || 'unknown_error';
    const frontendURL = env.FRONTEND_URL || 'http://localhost:3000';
    return reply.redirect(`${frontendURL}/auth/callback?error=${error}`);
  });

  // GET /auth/providers - List OAuth providers
  app.get('/auth/providers', (_, reply) => {
    return reply.code(200).send({
      providers: [
        {
          id: 'email',
          name: 'Email e Senha',
          type: 'credentials',
          endpoints: {
            login: '/auth/login',
            register: '/auth/register',
          },
        },
        {
          id: 'github',
          name: 'GitHub',
          type: 'oauth',
          url: '/auth/github',
          available: !!process.env.GITHUB_CLIENT_ID,
        },
        {
          id: 'google',
          name: 'Google',
          type: 'oauth',
          url: '/auth/google',
          available: !!process.env.GOOGLE_CLIENT_ID,
        },
      ],
    });
  });
}
