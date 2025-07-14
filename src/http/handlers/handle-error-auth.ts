import type { FastifyReply } from 'fastify';
import type { THandleError } from '../types/handle-error-login.ts';

export function handleAuthError(error: THandleError, reply: FastifyReply) {
  console.log('Handling auth error:', error);
  
  if (error && typeof error === 'object' && 'body' in error) {
    if (error.body.code === 'INVALID_EMAIL_OR_PASSWORD') {
      return reply.code(error.statusCode).send({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos',
      });
    }
    if (error.body.code === 'USER_ALREADY_EXISTS') {
      return reply.code(error.statusCode).send({
        error: 'Usuario já existe',
        message: 'Email já cadastrado',
      });
    }
    return reply.code(error.statusCode).send({
      error: error.body.code || 'Erro interno do servidor',
      message: error.body.message || 'Não foi possível realizar o login',
    });
  }
  return reply.code(500).send({
    error: 'Erro interno do servidor',
    message: 'Não foi possível realizar o login',
  });
}
