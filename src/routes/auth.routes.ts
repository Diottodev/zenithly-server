import type { FastifyInstance } from 'fastify';
import { type Login, loginSchema } from './schemas/user-routes.schema.ts';

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
      try {
        // Usar better-auth para fazer sign-in
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
        // Definir cookies de sessão se houver
        if (signInResult.token) {
          reply.header(
            'set-cookie',
            `better-auth.session_token=${signInResult.token}; HttpOnly; Path=/; SameSite=Lax`
          );
        }
        return reply.code(200).send({
          message: 'Login realizado com sucesso',
          user: signInResult.user,
          token: signInResult.token,
        });
      } catch (error) {
        app.log.error(error, 'Erro no login');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Não foi possível realizar o login',
        });
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
      if (!sessionToken) {
        return reply.code(401).send({
          error: 'Não autenticado',
          message: 'Token de sessão não fornecido',
        });
      }
      const sessionData = await app.betterAuth.api.getSession({
        headers: new Headers({
          authorization: `Bearer ${sessionToken}`,
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
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
          required: ['name', 'email', 'password'],
        },
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
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Não foi possível criar a conta',
        });
      }
    }
  );

  // GET /auth/github - GitHub OAuth login
  app.get('/auth/github', async (_, reply) => {
    try {
      const githubResult = await app.betterAuth.api.signInSocial({
        body: {
          provider: 'github',
          callbackURL: `${process.env.BETTER_AUTH_URL || 'http://localhost:3333'}/api/auth/callback/github`,
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
  app.get('/auth/google', async (_, reply) => {
    try {
      const googleResult = await app.betterAuth.api.signInSocial({
        body: {
          provider: 'google',
          callbackURL: `${process.env.BETTER_AUTH_URL || 'http://localhost:3333'}/api/auth/callback/google`,
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
