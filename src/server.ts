import { fastifyCors } from '@fastify/cors';
import { fastifyJwt } from '@fastify/jwt';
import { fastify } from 'fastify';
import * as v from 'valibot';
import { env } from './env.ts';
import { authRoutes } from './http/routes/auth.ts';
import { gmailRoutes } from './http/routes/gmail.ts';
import { googleCalendarRoutes } from './http/routes/google-calendar.ts';
import { integrationsRoutes } from './http/routes/integrations.ts';
import { noteRoutes } from './http/routes/notes.ts';
import { outlookRoutes } from './http/routes/outlook.ts';
import { outlookCalendarRoutes } from './http/routes/outlook-calendar.ts';
import { passwordRoutes } from './http/routes/passwords.ts';
import { taskRoutes } from './http/routes/tasks.ts';
import { userRoutes } from './http/routes/user.ts';
import betterAuthPlugin from './plugins/better-auth.plugin.ts';

export function createApp() {
  const app = fastify({ logger: false });
  app.addContentTypeParser(
    'application/x-www-form-urlencoded',
    (_request, payload, done) => {
      let body = '';
      payload.on('data', (chunk) => {
        body += chunk.toString();
      });
      payload.on('end', () => {
        done(null, Object.fromEntries(new URLSearchParams(body)));
      });
    }
  );
  app.register(fastifyCors, {
    origin: [env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
      return reply.code(400).send({
        error: 'Dados inválidos',
        message: issues[0]?.message || 'Dados fornecidos são inválidos',
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
    // Handle unsupported media type (Content-Type)
    if (error.statusCode === 415) {
      return reply.code(415).send({
        error: 'Tipo de conteúdo não suportado',
        message: error.message || 'Content-Type inválido',
      });
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
  app.get('/', () => {
    return {
      message: 'Welcome to Zenithly Server',
      version: process.env.npm_package_version || 'unknown',
      environment: env.NODE_ENV || 'development',
      documentation: 'https://api.zenithly.com/docs',
      frontend: env.FRONTEND_URL || 'http://localhost:3000',
    };
  });
  // Health check endpoint
  app.get(`/${env.VERSION}/api/health`, async () => {
    const healthCheck: {
      status: string;
      timestamp: string;
      uptime: number;
      memory: NodeJS.MemoryUsage;
      pid: number;
      environment: string | undefined;
      version: string;
      database?: string;
    } = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
      environment: env.NODE_ENV,
      version: process.version,
    };
    try {
      // Test database connection
      const { db } = await import('./db/connection.ts');
      await db.execute('SELECT 1');
      healthCheck.database = 'connected';
    } catch (_error) {
      healthCheck.database = 'disconnected';
      healthCheck.status = 'ERROR';
    }
    return healthCheck;
  });
  app.register(gmailRoutes, {
    prefix: `/${env.VERSION}/api/gmail`,
  });
  app.register(googleCalendarRoutes, {
    prefix: `/${env.VERSION}/api/google/calendar`,
  });
  app.register(outlookRoutes, {
    prefix: `/${env.VERSION}/api/outlook`,
  });
  app.register(outlookCalendarRoutes, {
    prefix: `/${env.VERSION}/api/outlook/calendar`,
  });
  app.register(userRoutes, {
    prefix: `/${env.VERSION}/api/user`,
  });
  app.register(authRoutes, {
    prefix: `/${env.VERSION}/api/auth`,
  });
  app.register(integrationsRoutes, {
    prefix: `/${env.VERSION}/api/integrations`,
  });
  app.register(noteRoutes, {
    prefix: `/${env.VERSION}/api/notes`,
  });
  app.register(taskRoutes, {
    prefix: `/${env.VERSION}/api/tasks`,
  });
  app.register(passwordRoutes, {
    prefix: `/${env.VERSION}/api/passwords`,
  });
  return app;
}
if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen({ port: env.PORT, host: env.HOST }, (err) => {
    if (err) {
      app.log.error(err, 'Server failed to start');
      process.exit(1);
    }
    app.log.info(
      `Server running at http://${env.HOST}:${env.PORT}/${env.VERSION}/api`
    );
  });
}
