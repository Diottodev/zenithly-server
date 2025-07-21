import {
  type InferOutput,
  minLength,
  object,
  optional,
  pipe,
  string,
} from 'valibot';

export const createPasswordSchema = object({
  service: pipe(string(), minLength(1, 'O serviço é obrigatório')),
  username: pipe(string(), minLength(1, 'O nome de usuário é obrigatório')),
  password: pipe(string(), minLength(1, 'A senha é obrigatória')),
});

export const updatePasswordSchema = object({
  service: optional(pipe(string(), minLength(1, 'O serviço é obrigatório'))),
  username: optional(
    pipe(string(), minLength(1, 'O nome de usuário é obrigatório'))
  ),
  password: optional(pipe(string(), minLength(1, 'A senha é obrigatória'))),
});

export type TCreatePassword = InferOutput<typeof createPasswordSchema>;
export type TUpdatePassword = InferOutput<typeof updatePasswordSchema>;
