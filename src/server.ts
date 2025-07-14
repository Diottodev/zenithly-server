import { log } from 'node:console';
import { fastifyCors } from '@fastify/cors';
import { fastifyJwt } from '@fastify/jwt';
import { fastify } from 'fastify';
import * as v from 'valibot';
import { env } from './env.ts';
import { authRoutes } from './http/routes/auth.routes.ts';
import { userRoutes } from './http/routes/user.routes.ts';
import betterAuthPlugin from './plugins/better-auth.plugin.ts';
import { auth } from './auth.ts';

export function createApp() {
  const app = fastify();
  app.register(fastifyCors, {
    origin: ['localhost:3000'],
  });
  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });
  app.register(betterAuthPlugin);
  app.setValidatorCompiler(({ schema, httpPart }) => {
    return (data) => {
      // Only validate if the schema for the httpPart exists and is a Valibot schema
      if (!httpPart) {
        return { value: data };
      }
      if (!schema) {
        return { value: data };
      }
      const valibotSchema = schema as v.BaseSchema<
        unknown,
        unknown,
        v.BaseIssue<unknown>
      >;
      // Check if we have a valid Valibot schema
      if (
        !valibotSchema ||
        typeof valibotSchema !== 'object' ||
        !('kind' in valibotSchema)
      ) {
        return { value: data };
      }
      const result = v.safeParse(valibotSchema, data);
      if (result.success) {
        return { value: result.output };
      }
      // Create a more detailed error for validation failures
      const validationError = new Error('Validation failed') as Error & {
        validation: v.BaseIssue<unknown>[];
        statusCode: number;
      };
      validationError.validation = result.issues;
      validationError.statusCode = 400;
      return { error: validationError };
    };
  });
  // Error handler for validation errors
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error, 'Request error');
    // Helper function to handle validation issues
    const handleValidationIssues = (issues: v.BaseIssue<unknown>[]) => {
      const firstIssue = issues[0];
      return reply.code(400).send({
        error: 'Dados inválidos',
        message: firstIssue?.message || 'Dados fornecidos são inválidos',
        details: issues.map((issue) => ({
          field: issue.path?.[0]?.key || 'unknown',
          message: issue.message,
        })),
      });
    };
    // Handle custom validation errors with validation property
    if ('validation' in error && Array.isArray(error.validation)) {
      return handleValidationIssues(
        error.validation as unknown as v.BaseIssue<unknown>[]
      );
    }
    // Handle validation errors from JSON.parse fallback
    if (error.message.startsWith('[') && error.message.endsWith(']')) {
      try {
        const issues = JSON.parse(error.message) as v.BaseIssue<unknown>[];
        return handleValidationIssues(issues);
      } catch {
        // If parsing fails, fall through to generic error
      }
    }
    // Handle other Fastify validation errors
    if (error.statusCode === 400) {
      return reply.code(400).send({
        error: 'Dados inválidos',
        message: error.message || 'Dados fornecidos são inválidos',
      });
    }
    // Generic server error
    return reply.code(error.statusCode || 500).send({
      error: 'Erro interno do servidor',
      message: error.message || 'Algo deu errado',
    });
  });
  app.register(userRoutes);
  app.register(authRoutes);
  app.get('/health', () => {
    return { status: 'OK' };
  });
  return app;
}

// Starting server
const app = createApp();
app.listen({ port: env.PORT }, (err) => {
  if (err) {
    log(err, 'Server failed to start');
    process.exit(1);
  }
  log(`Server is running at http://localhost:${env.PORT}`);
});
