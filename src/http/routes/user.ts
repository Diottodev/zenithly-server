import { and, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/drizzle/index.ts';
import type { TUpdateUser } from '../schemas/index.ts';
import { updateUserSchema } from '../schemas/user.ts';

export function userRoutes(app: FastifyInstance) {
  // GET /users - Search user by ID
  app.get('/get', async (request, reply) => {
    const { sub: id } = (request.user as { sub: string }) || {};
    try {
      const user = await db
        .select({
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          emailVerified: schema.user.emailVerified,
          image: schema.user.image,
          role: schema.user.role,
          createdAt: schema.user.createdAt,
          updatedAt: schema.user.updatedAt,
          hasCompletedOnboarding: schema.user.hasCompletedOnboarding,
          onboardingStep: schema.user.onboardingStep,
        })
        .from(schema.user)
        .where(eq(schema.user.id, id))
        .limit(1);
      if (user.length === 0) {
        return reply.code(404).send({
          error: 'Usuário não encontrado',
          message: 'Usuário não foi encontrado',
        });
      }
      return reply.code(200).send({ user: user[0] });
    } catch (error) {
      app.log.error(error, 'Erro ao buscar usuário');
      return reply.code(500).send({
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o usuário',
      });
    }
  });

  // PUT /users - Update user
  app.put(
    '/update',
    {
      schema: {
        body: updateUserSchema,
      },
    },
    async (request, reply) => {
      const { sub: id } = request.user as { sub: string };
      const updateData = request.body as TUpdateUser;
      try {
        const existingUser = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.id, id))
          .limit(1);
        if (existingUser.length === 0) {
          return reply.code(404).send({
            error: 'Usuário não encontrado',
            message: 'Usuário não foi encontrado',
          });
        }
        if (updateData.email) {
          const emailExists = await db
            .select({ id: schema.user.id })
            .from(schema.user)
            .where(
              and(
                eq(schema.user.email, updateData.email),
                eq(schema.user.id, id)
              )
            )
            .limit(1);
          if (emailExists.length > 0) {
            return reply.code(409).send({
              error: 'Email já cadastrado',
              message: 'Este email já está sendo usado por outro usuário',
            });
          }
        }
        const [user] = await db
          .update(schema.user)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(schema.user.id, id))
          .returning({
            id: schema.user.id,
            name: schema.user.name,
            email: schema.user.email,
            emailVerified: schema.user.emailVerified,
            image: schema.user.image,
            role: schema.user.role,
            createdAt: schema.user.createdAt,
            updatedAt: schema.user.updatedAt,
            hasCompletedOnboarding: schema.user.hasCompletedOnboarding,
            onboardingStep: schema.user.onboardingStep,
          });
        return reply.code(200).send({
          message: 'Usuário atualizado com sucesso',
          user,
        });
      } catch (error) {
        app.log.error(error, 'Erro ao atualizar usuário');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Não foi possível atualizar o usuário',
        });
      }
    }
  );

  // DELETE /users - Delete user
  app.delete('/delete', async (request, reply) => {
    const { sub: id } = request.user as { sub: string };
    try {
      const existingUser = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.id, id))
        .limit(1);

      if (existingUser.length === 0) {
        return reply.code(404).send({
          error: 'Usuário não encontrado',
          message: 'Usuário não foi encontrado',
        });
      }
      await db.delete(schema.account).where(eq(schema.account.userId, id));
      await db.delete(schema.session).where(eq(schema.session.userId, id));
      await db
        .delete(schema.tutorialProgress)
        .where(eq(schema.tutorialProgress.userId, id));
      await db
        .delete(schema.userIntegrations)
        .where(eq(schema.userIntegrations.userId, id));
      await db.delete(schema.user).where(eq(schema.user.id, id));
      return reply.code(204).send();
    } catch (error) {
      app.log.error(error, 'Erro ao deletar usuário');
      return reply.code(500).send({
        error: 'Erro interno do servidor',
        message: 'Não foi possível deletar o usuário',
      });
    }
  });
}
