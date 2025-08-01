import { and, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.ts';
import { notes } from '../../db/drizzle/notes.ts';
import type { TRouteParams, TUpdateNote } from '../schemas/index.ts';
import {
  createNoteSchema,
  type TCreateNote,
  updateNoteSchema,
} from '../schemas/notes.ts';

export function noteRoutes(app: FastifyInstance) {
  app.post(
    '/create',
    {
      schema: {
        body: createNoteSchema,
      },
    },
    async (request, reply) => {
      const { title, content } = request.body as TCreateNote;
      const userId = (request as { user: { sub: string } }).user.sub;
      const value = {
        title: title as string,
        content: content as string,
        userId: userId as string,
      };
      try {
        const [note] = await db.insert(notes).values(value).returning();
        return reply.code(201).send(note);
      } catch (error) {
        app.log.error(error, 'Error creating note');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  app.get('/list', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;

    try {
      const userNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.userId, userId));

      return reply.code(200).send(userNotes);
    } catch (error) {
      app.log.error(error, 'Error fetching notes');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
  app.get('/get/:id', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;
    const { id } = request.params as TRouteParams;
    try {
      const [note] = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, id), eq(notes.userId, userId)));

      if (!note) {
        return reply.code(404).send({ message: 'Note not found' });
      }

      return reply.code(200).send(note);
    } catch (error) {
      app.log.error(error, 'Error fetching note');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
  app.put(
    '/update/:id',
    {
      schema: {
        body: updateNoteSchema,
      },
    },
    async (request, reply) => {
      const userId = (request as { user: { sub: string } }).user.sub;
      const { id } = request.params as TRouteParams;
      const { title, content } = request.body as TUpdateNote;
      try {
        const [updatedNote] = await db
          .update(notes)
          .set({ title, content, updatedAt: new Date() })
          .where(and(eq(notes.id, id), eq(notes.userId, userId)))
          .returning();
        if (!updatedNote) {
          return reply.code(404).send({ message: 'Note not found' });
        }
        return reply.code(200).send(updatedNote);
      } catch (error) {
        app.log.error(error, 'Error updating note');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  app.delete('/delete/:id', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;
    const { id } = request.params as TRouteParams;
    try {
      const [deletedNote] = await db
        .delete(notes)
        .where(and(eq(notes.id, id), eq(notes.userId, userId)))
        .returning();
      if (!deletedNote) {
        return reply.code(404).send({ message: 'Note not found' });
      }
      return reply.code(204).send();
    } catch (error) {
      app.log.error(error, 'Error deleting note');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
}
