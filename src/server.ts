import { log } from 'node:console';
import { fastifyCors } from '@fastify/cors';
import { fastifyJwt } from '@fastify/jwt';
import { fastify } from 'fastify';
import * as v from 'valibot';
import { env } from './env.ts';
import betterAuthPlugin from './plugins/better-auth.plugin.ts';
import { authRoutes } from './routes/auth.routes.ts';
import { userRoutes } from './routes/user.routes.ts';

const app = fastify();
app.register(fastifyCors, {
  origin: '*',
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
    const valibotSchema = (schema as Record<string, unknown>)[httpPart];
    // Check if we have a valid Valibot schema
    if (
      !valibotSchema ||
      typeof valibotSchema !== 'object' ||
      !('kind' in valibotSchema)
    ) {
      return { value: data };
    }
    const result = v.safeParse(
      valibotSchema as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      data
    );
    if (result.success) {
      return { value: result.output };
    }
    return { error: new Error(JSON.stringify(result.issues)) };
  };
});
app.register(userRoutes);
app.register(authRoutes);
app.get('/health', () => {
  return { status: 'OK' };
});
app.listen({ port: env.PORT }, (err) => {
  if (err) {
    log(err, 'Server failed to start');
    process.exit(1);
  }
  log(`Server is running at http://localhost:${env.PORT}`);
});
