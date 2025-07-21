import { type InferOutput, minLength, object, pipe, string } from 'valibot';

export const sendGmailSchema = object({
  to: pipe(string(), minLength(1, 'O destinatário é obrigatório')),
  subject: pipe(string(), minLength(1, 'O assunto é obrigatório')),
  body: pipe(string(), minLength(1, 'O corpo do e-mail é obrigatório')),
});

export type TSendGmail = InferOutput<typeof sendGmailSchema>;
