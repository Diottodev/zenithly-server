import { log } from 'node:console';
import { fastifyCors } from '@fastify/cors';
import { fastify } from 'fastify';
import * as v from 'valibot';
import { env } from './env.ts';

const app = fastify();
app.register(fastifyCors, {
  origin: '*',
});
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
app.get('/health', () => {
  return { status: 'OK' };
});
app.listen({ port: env.PORT }, (err) => {
  if (err) {
    log(err, 'Server failed to start');
    process.exit(1);
  }
  log(`Server is running at http://localhost:${process.env.PORT || 3333}`);
});
