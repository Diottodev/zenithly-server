import bcrypt from 'bcryptjs';
import { and, count, eq, like, or, type SQL } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import { db } from '../db/connection.ts';
import { schema } from '../db/drizzle/index.ts';
import {
  type CreateUser,
  createUserSchema,
  type UpdateUser,
  type UserParams,
  type UserQuery,
  updateUserSchema,
  userParamsSchema,
  userQuerySchema,
} from './schemas/user-routes.schema.ts';

export function userRoutes(app: FastifyInstance) {
  // GET /users - List users with pagination and filtering
  app.get<{
    Querystring: UserQuery;
  }>(
    '/users',
    {
      schema: {
        querystring: userQuerySchema,
      },
    },
    async (request, reply) => {
      const { page = 1, limit = 10, search, role } = request.query;
      const offset = (page - 1) * limit;
      try {
        const conditions: SQL[] = [];
        if (search) {
          const searchCondition = or(
            like(schema.user.name, `%${search}%`),
            like(schema.user.email, `%${search}%`)
          );
          if (searchCondition) {
            conditions.push(searchCondition);
          }
        }
        if (role) {
          conditions.push(eq(schema.user.role, role));
        }
        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;
        const users = await db
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
          .where(whereClause)
          .limit(limit)
          .offset(offset);
        const [{ total }] = await db
          .select({ total: count() })
          .from(schema.user)
          .where(whereClause);
        const totalPages = Math.ceil(total / limit);
        return reply.code(200).send({
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        });
      } catch (error) {
        app.log.error(error, 'Erro ao buscar usuários');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Não foi possível buscar os usuários',
        });
      }
    }
  );

  // GET /users/:id - Search user by ID
  app.get<{
    Params: UserParams;
  }>(
    '/users/:id',
    {
      schema: {
        params: userParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
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
            message: `Usuário com ID ${id} não foi encontrado`,
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
    }
  );

  // POST /users - Create user
  app.post<{
    Body: CreateUser;
  }>(
    '/users',
    {
      schema: {
        body: createUserSchema,
      },
    },
    async (request, reply) => {
      const { name, email, password, image, role } = request.body;
      try {
        const existingUser = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.email, email))
          .limit(1);
        if (existingUser.length > 0) {
          return reply.code(409).send({
            error: 'Email já cadastrado',
            message: 'Este email já está sendo usado por outro usuário',
          });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = nanoid();
        const [user] = await db
          .insert(schema.user)
          .values({
            id: userId,
            name,
            email,
            image,
            role: role || 'user',
          })
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
        await db.insert(schema.account).values({
          id: nanoid(),
          accountId: email,
          providerId: 'credential',
          userId,
          password: hashedPassword,
        });
        return reply.code(201).send({
          message: 'Usuário criado com sucesso',
          user,
        });
      } catch (error) {
        app.log.error(error, 'Erro ao criar usuário');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Não foi possível criar o usuário',
        });
      }
    }
  );

  // PUT /users/:id - Update user
  app.put<{
    Params: UserParams;
    Body: UpdateUser;
  }>(
    '/users/:id',
    {
      schema: {
        params: userParamsSchema,
        body: updateUserSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updateData = request.body;
      try {
        const existingUser = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.id, id))
          .limit(1);
        if (existingUser.length === 0) {
          return reply.code(404).send({
            error: 'Usuário não encontrado',
            message: `Usuário com ID ${id} não foi encontrado`,
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

  // DELETE /users/:id - Delete user
  app.delete<{
    Params: UserParams;
  }>(
    '/users/:id',
    {
      schema: {
        params: userParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const existingUser = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.id, id))
          .limit(1);

        if (existingUser.length === 0) {
          return reply.code(404).send({
            error: 'Usuário não encontrado',
            message: `Usuário com ID ${id} não foi encontrado`,
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
        return reply.code(200).send({
          message: 'Usuário deletado com sucesso',
        });
      } catch (error) {
        app.log.error(error, 'Erro ao deletar usuário');
        return reply.code(500).send({
          error: 'Erro interno do servidor',
          message: 'Não foi possível deletar o usuário',
        });
      }
    }
  );
}
