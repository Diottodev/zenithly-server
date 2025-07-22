import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { google } from 'googleapis';
import { db } from '../../db/connection.ts';
import { userIntegrations } from '../../db/drizzle/user-integration.ts';
import { env } from '../../env.ts';
import { sendGmailSchema, type TSendGmail } from '../schemas/gmail.ts';

export function gmailRoutes(app: FastifyInstance) {
  // Helper to get authenticated Gmail client
  const getGmailClient = async (userId: string) => {
    const integration = await db.query.userIntegrations.findFirst({
      where: eq(userIntegrations.userId, userId),
    });
    if (!integration?.gmailAccessToken) {
      throw new Error('Gmail integration not found or not enabled.');
    }
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: integration.gmailAccessToken,
      refresh_token: integration.gmailRefreshToken,
      expiry_date: integration.gmailTokenExpiresAt?.getTime(),
    });
    // Refresh token if expired (refreshAccessToken handles the check internally)
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db
      .update(userIntegrations)
      .set({
        gmailAccessToken: credentials.access_token,
        gmailRefreshToken: credentials.refresh_token,
        gmailTokenExpiresAt: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(userIntegrations.userId, userId));
    oauth2Client.setCredentials(credentials);
    return google.gmail({ version: 'v1', auth: oauth2Client });
  };

  // GET /gmail/messages - List messages
  app.get('/messages', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;
    try {
      const gmail = await getGmailClient(userId);
      const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 200,
      });
      const messages = res.data.messages || [];
      // Buscar apenas os headers de todas as mensagens (From, To, Subject)
      const details = await Promise.all(
        messages.map(async (msg) => {
          if (!msg.id) {
            return null;
          }
          const msgRes = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject'],
          });
          const { id, threadId, snippet, internalDate, labelIds, payload } =
            msgRes.data;
          let from = '';
          let to = '';
          let subject = '';
          if (payload?.headers) {
            for (const h of payload.headers) {
              const name = h.name?.toLowerCase();
              if (name === 'from') {
                from = h.value as string;
              }
              if (name === 'to') {
                to = h.value as string;
              }
              if (name === 'subject') {
                subject = h.value as string;
              }
            }
          }
          return {
            id,
            threadId,
            snippet,
            internalDate,
            labelIds,
            from,
            to,
            subject,
          };
        })
      );
      return reply.code(200).send(details.filter(Boolean));
    } catch (error) {
      app.log.error(error, 'Error listing Gmail messages');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
  // GET /gmail/messages/:messageId - Get message details
  app.get('/messages/:messageId', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;
    const { messageId } = request.params as { messageId: string };
    try {
      const gmail = await getGmailClient(userId);
      const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });
      return reply.code(200).send(res.data);
    } catch (error) {
      app.log.error(error, 'Error getting Gmail message');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
  // POST /gmail/send - Send email
  app.post(
    '/send',
    {
      schema: {
        body: sendGmailSchema,
      },
    },
    async (request, reply) => {
      const userId = (request as { user: { sub: string } }).user.sub;
      const { to, subject, body } = request.body as TSendGmail;
      try {
        const gmail = await getGmailClient(userId);
        const raw = Buffer.from(`To: ${to}\nSubject: ${subject}\n\n${body}`)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw,
          },
        });
        return reply.code(200).send({ message: 'Email sent successfully' });
      } catch (error) {
        app.log.error(error, 'Error sending Gmail message');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
}
