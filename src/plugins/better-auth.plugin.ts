import fp from 'fastify-plugin';
import { auth } from '../auth.ts';
import { env } from '../env.ts';
import { extractSessionToken } from '../utils/extract-session-token.ts';

declare module 'fastify' {
  interface FastifyInstance {
    betterAuth: typeof auth;
  }
  interface FastifyRequest {
    user: string | object | Buffer;
  }
}

export default fp((fastify, _opts, done) => {
  fastify.decorate('betterAuth', auth);
  // Log de debug para todas as rotas registradas
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url.includes('/api/auth')) {
      fastify.log.info(
        `Registrando rota Better Auth: ${routeOptions.method} ${routeOptions.url}`
      );
    }
  });
  // Register the auth handler for API routes
  fastify.register((app) => {
    app.all(`/${env.VERSION}/api/auth/*`, async (request, reply) => {
      app.log.info(`Better Auth request: ${request.method} ${request.url}`);
      // Garantir headers CORS para todas as requisições de auth
      reply.header(
        'Access-Control-Allow-Origin',
        env.FRONTEND_URL || 'http://localhost:3000'
      );
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      reply.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Cookie'
      );
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return reply.code(200).send();
      }
      const url = new URL(request.url, `http://${request.headers.host}`);
      // Preparar headers, incluindo cookies
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) {
          for (const v of value) {
            headers.append(key, v);
          }
        } else if (value) {
          headers.set(key, value);
        }
      }
      // Create a web request compatible with better-auth
      const webRequest = new Request(url.toString(), {
        method: request.method,
        headers,
        body:
          request.method !== 'GET' && request.method !== 'HEAD'
            ? JSON.stringify(request.body)
            : undefined,
      });
      try {
        const response = await auth.handler(webRequest);
        // Copy headers from response to reply
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });
        // Handle different response types
        const contentType = response.headers.get('content-type');
        if (response.status >= 300 && response.status < 400) {
          // Handle redirects
          const location = response.headers.get('location');
          if (location) {
            return reply.code(response.status).redirect(location);
          }
        }
        // Send response based on content type
        if (contentType?.includes('application/json')) {
          const body = await response.text();
          return reply
            .code(response.status)
            .send(body ? JSON.parse(body) : undefined);
        }
        const body = await response.text();
        return reply
          .code(response.status)
          .type(contentType || 'text/plain')
          .send(body);
      } catch (error) {
        app.log.error(error, 'Erro no handler do better-auth');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Erro na autenticação',
        });
      }
    });
  });
  // Pre-handler hook to set request.user for all routes
  fastify.addHook('preHandler', async (request, _reply) => {
    if (request.url.startsWith('/api/auth')) {
      return; // Auth routes handle their own authentication
    }
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
      if (token) {
        const sessionData = await auth.api.getSession({
          headers: new Headers({
            authorization: `Bearer ${token}`,
            ...(sessionTokenFromCookie
              ? {
                cookie: `__Secure-better-auth.session_token=${sessionTokenFromCookie}`,
              }
              : {}),
          }),
        });
        if (sessionData?.user) {
          request.user = { sub: sessionData.user.id };
        }
      }
    } catch (error) {
      fastify.log.error(error, 'Error in preHandler hook');
      // Do not block the request, just don't set request.user
    }
  });
  done();
});
