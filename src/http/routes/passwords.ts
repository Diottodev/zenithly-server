import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { db } from '../../db/connection.ts';
import { passwords } from '../../db/drizzle/passwords.ts';
import type {
  TCreatePassword,
  TRouteParams,
  TUpdatePassword,
} from '../schemas/index.ts';
import {
  createPasswordSchema,
  updatePasswordSchema,
} from '../schemas/passwords.ts';

export function passwordRoutes(app: FastifyInstance) {
  app.post(
    '/passwords',
    {
      schema: {
        body: createPasswordSchema,
      },
    },
    async (request, reply) => {
      const { service, username, password } =
        request.body as TCreatePassword;
      const userId = (request as FastifyRequest & { user: { sub: string } })
        .user.sub;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [newPassword] = await db
          .insert(passwords)
          .values({ service, username, password: hashedPassword, userId })
          .returning();

        return reply.code(201).send(newPassword);
      } catch (error) {
        app.log.error(error, 'Error creating password');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  app.get('/passwords', async (request, reply) => {
    const userId = (request as FastifyRequest & { user: { sub: string } }).user
      .sub;
    try {
      const userPasswords = await db
        .select()
        .from(passwords)
        .where(eq(passwords.userId, userId));
      return reply.code(200).send(userPasswords);
    } catch (error) {
      app.log.error(error, 'Error fetching passwords');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });

  app.get('/passwords/:id', async (request, reply) => {
    const userId = (request as FastifyRequest & { user: { sub: string } }).user
      .sub;
    const { id } = request.params as TRouteParams;
    try {
      const [password] = await db
        .select()
        .from(passwords)
        .where(and(eq(passwords.id, id), eq(passwords.userId, userId)));
      if (!password) {
        return reply.code(404).send({ message: 'Password not found' });
      }
      return reply.code(200).send(password);
    } catch (error) {
      app.log.error(error, 'Error fetching password');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
  app.put(
    '/passwords/:id',
    {
      schema: {
        body: updatePasswordSchema,
      },
    },
    async (request, reply) => {
      const userId = (request as FastifyRequest & { user: { sub: string } })
        .user.sub;
      const { id } = request.params as TRouteParams;
      const { service, username, password } =
        request.body as TUpdatePassword;
      try {
        let hashedPassword: string | undefined;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }
        const [updatedPassword] = await db
          .update(passwords)
          .set({
            service,
            username,
            password: hashedPassword,
            updatedAt: new Date(),
          })
          .where(and(eq(passwords.id, id), eq(passwords.userId, userId)))
          .returning();
        if (!updatedPassword) {
          return reply.code(404).send({ message: 'Password not found' });
        }
        return reply.code(200).send(updatedPassword);
      } catch (error) {
        app.log.error(error, 'Error updating password');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  app.delete('/passwords/:id', async (request, reply) => {
    const userId = (request as FastifyRequest & { user: { sub: string } }).user
      .sub;
    const { id } = request.params as TRouteParams;
    try {
      const [deletedPassword] = await db
        .delete(passwords)
        .where(and(eq(passwords.id, id), eq(passwords.userId, userId)))
        .returning();

      if (!deletedPassword) {
        return reply.code(404).send({ message: 'Password not found' });
      }
      return reply.code(204).send();
    } catch (error) {
      app.log.error(error, 'Error deleting password');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
}
