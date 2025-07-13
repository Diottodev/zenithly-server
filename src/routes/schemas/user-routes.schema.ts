import * as v from 'valibot';

export const createUserSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(2, 'Nome deve ter pelo menos 2 caracteres')
  ),
  email: v.pipe(v.string(), v.email('Email inválido')),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Senha deve ter pelo menos 8 caracteres')
  ),
  image: v.optional(v.pipe(v.string(), v.url('URL da imagem inválida'))),
  role: v.optional(v.string(), 'user'),
});

export const updateUserSchema = v.object({
  name: v.optional(
    v.pipe(v.string(), v.minLength(2, 'Nome deve ter pelo menos 2 caracteres'))
  ),
  email: v.optional(v.pipe(v.string(), v.email('Email inválido'))),
  image: v.optional(v.pipe(v.string(), v.url('URL da imagem inválida'))),
  role: v.optional(v.string()),
  hasCompletedOnboarding: v.optional(v.boolean()),
  onboardingStep: v.optional(v.string()),
});

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email('Email inválido')),
  password: v.pipe(v.string(), v.minLength(1, 'Senha é obrigatória')),
});

export const userParamsSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, 'ID do usuário é obrigatório')),
});

export const userQuerySchema = v.object({
  page: v.optional(v.pipe(v.string(), v.transform(Number))),
  limit: v.optional(v.pipe(v.string(), v.transform(Number))),
  search: v.optional(v.string()),
  role: v.optional(v.string()),
});

export type CreateUser = v.InferOutput<typeof createUserSchema>;
export type UpdateUser = v.InferOutput<typeof updateUserSchema>;
export type Login = v.InferOutput<typeof loginSchema>;
export type UserParams = v.InferOutput<typeof userParamsSchema>;
export type UserQuery = v.InferOutput<typeof userQuerySchema>;
