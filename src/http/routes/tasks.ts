import { and, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { tasks } from '../../db/drizzle/tasks.ts';
import type {
  TCreateTask,
  TRouteParams,
  TUpdateTask,
} from '../schemas/index.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/tasks.ts';

const allowedStatus = [
  'todo',
  'in_progress',
  'review',
  'blocked',
  'done',
  'canceled',
  'pendind',
] as const;

export function taskRoutes(app: FastifyInstance) {
  app.post(
    '/create',
    {
      schema: {
        body: createTaskSchema,
      },
    },
    async (request, reply) => {
      const { title, description, status } = request.body as TCreateTask;
      const userId = (request.user as { user: { sub: string } }).user.sub;
      try {
        const [task] = await db
          .insert(tasks)
          .values({
            title,
            description,
            status: (status as (typeof allowedStatus)[number]) || 'todo',
            userId,
          })
          .returning();
        return reply.code(201).send(task);
      } catch (error) {
        app.log.error(error, 'Error creating task');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  app.get('/list', async (request, reply) => {
    const userId = (request.user as { user: { sub: string } }).user.sub;
    try {
      const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId));

      return reply.code(200).send(userTasks);
    } catch (error) {
      app.log.error(error, 'Error fetching tasks');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });

  app.get('/get/:id', async (request, reply) => {
    const userId = (request.user as { user: { sub: string } }).user.sub;
    const { id } = request.params as TRouteParams;
    try {
      const [task] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
      if (!task) {
        return reply.code(404).send({ message: 'Task not found' });
      }
      return reply.code(200).send(task);
    } catch (error) {
      app.log.error(error, 'Error fetching task');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
  app.put(
    '/update/:id',
    {
      schema: {
        body: updateTaskSchema,
      },
    },
    async (request, reply) => {
      const userId = (request.user as { user: { sub: string } }).user.sub;
      const { id } = request.params as TRouteParams;
      const { title, description, status } = request.body as TUpdateTask;
      try {
        const [updatedTask] = await db
          .update(tasks)
          .set({
            title,
            description,
            status: (status as (typeof allowedStatus)[number]) || 'todo',
            updatedAt: new Date(),
          })
          .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
          .returning();
        if (!updatedTask) {
          return reply.code(404).send({ message: 'Task not found' });
        }
        return reply.code(200).send(updatedTask);
      } catch (error) {
        app.log.error(error, 'Error updating task');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  app.delete('/delete/:id', async (request, reply) => {
    const userId = (request.user as { user: { sub: string } }).user.sub;
    const { id } = request.params as TRouteParams;
    try {
      const [deletedTask] = await db
        .delete(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
        .returning();
      if (!deletedTask) {
        return reply.code(404).send({ message: 'Task not found' });
      }
      return reply.code(204).send();
    } catch (error) {
      app.log.error(error, 'Error deleting task');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
}
