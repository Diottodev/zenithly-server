import type { FastifyReply, FastifyRequest } from 'fastify';
import { extractSessionToken } from '@/utils/extract-session-token.ts';

type TAuthenticatedRequest = FastifyRequest & {
  currentUser?: unknown;
  currentSession?: unknown;
};

export async function authMiddleware(
  request: TAuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const sessionToken = extractSessionToken({
      cookie: request.headers.cookie,
    });
    if (!sessionToken) {
      return reply.code(401).send({
        error: 'Não autenticado',
        message: 'Token de sessão não fornecido',
      });
    }
    const sessionData = await request.server.betterAuth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${sessionToken}`,
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
