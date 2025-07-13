import fp from 'fastify-plugin';
import { auth } from '../auth.ts';

declare module 'fastify' {
  interface FastifyInstance {
    betterAuth: typeof auth;
  }
}

export default fp((fastify, _opts, done) => {
  fastify.decorate('betterAuth', auth);
  // Register the auth handler for API routes
  fastify.register((app) => {
    app.all('/api/auth/*', async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      // Create a web request compatible with better-auth
      const webRequest = new Request(url.toString(), {
        method: request.method,
        headers: new Headers(request.headers as Record<string, string>),
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
        // Send response
        const body = await response.text();
        return reply
          .code(response.status)
          .send(body ? JSON.parse(body) : undefined);
      } catch (error) {
        app.log.error(error, 'Erro no handler do better-auth');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Erro na autenticação',
        });
      }
    });
  });
  done();
});
