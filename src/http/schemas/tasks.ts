import {
  type InferInput,
  literal,
  minLength,
  object,
  optional,
  pipe,
  string,
  union,
} from 'valibot';

const taskStatusEnum = union([
  literal('todo'),
  literal('pending'),
  literal('in_progress'),
  literal('review'),
  literal('blocked'),
  literal('done'),
  literal('canceled'),
]);

export const createTaskSchema = object({
  title: pipe(string(), minLength(1, 'O título é obrigatório')),
  description: optional(string()),
  status: optional(taskStatusEnum),
});

export const updateTaskSchema = object({
  title: optional(pipe(string(), minLength(1, 'O título é obrigatório'))),
  description: optional(string()),
  status: optional(taskStatusEnum),
});

export type TCreateTask = InferInput<typeof createTaskSchema>;
export type TUpdateTask = InferInput<typeof updateTaskSchema>;
export type TStatusEnum =
  | 'todo'
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'blocked'
  | 'done'
  | 'canceled';
