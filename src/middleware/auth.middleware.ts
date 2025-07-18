import type { FastifyReply, FastifyRequest } from 'fastify';

type TAuthenticatedRequest = FastifyRequest & {
  currentUser?: unknown;
  currentSession?: unknown;
};

export async function authMiddleware(
  request: TAuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const sessionToken = request.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return reply.code(401).send({
        error: 'Não autenticado',
        message: 'Token de sessão não fornecido',
      });
    }
    const sessionData = await request.server.betterAuth.api.getSession({
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
    request.currentUser = sessionData.user;
    request.currentSession = sessionData.session;
  } catch {
    return reply.code(401).send({
      error: 'Não autenticado',
      message: 'Token inválido ou expirado',
    });
  }
}
