import {
  type InferInput,
  minLength,
  object,
  optional,
  pipe,
  string,
} from 'valibot';

export const createNoteSchema = object({
  title: optional(pipe(string(), minLength(1, 'O título é obrigatório'))),
  content: optional(pipe(string(), minLength(1, 'O conteúdo é obrigatório'))),
});

export const updateNoteSchema = object({
  title: optional(pipe(string(), minLength(1, 'O título é obrigatório'))),
  content: optional(pipe(string(), minLength(1, 'O conteúdo é obrigatório'))),
});

export type TCreateNote = InferInput<typeof createNoteSchema>;
export type TUpdateNote = InferInput<typeof updateNoteSchema>;