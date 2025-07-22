import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { google } from 'googleapis';
import { db } from '../../db/connection.ts';
import { userIntegrations } from '../../db/drizzle/user-integration.ts';
import { env } from '../../env.ts';
import {
  createGoogleCalendarEventSchema,
  updateGoogleCalendarEventSchema,
} from '../schemas/google-calendar.ts';
import type {
  TCreateGoogleCalendarEvent,
  TUpdateGoogleCalendarEvent,
} from '../schemas/index.ts';

export function googleCalendarRoutes(app: FastifyInstance) {
  // Helper to get authenticated Google Calendar client
  const getCalendarClient = async (userId: string) => {
    const integration = await db.query.userIntegrations.findFirst({
      where: eq(userIntegrations.userId, userId),
    });
    if (!integration?.googleCalendarAccessToken) {
      throw new Error('Google Calendar integration not found or not enabled.');
    }
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: integration.googleCalendarAccessToken,
      refresh_token: integration.googleCalendarRefreshToken,
      expiry_date: integration.googleCalendarTokenExpiresAt?.getTime(),
    });
    // Refresh token if expired (refreshAccessToken handles the check internally)
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db
      .update(userIntegrations)
      .set({
        googleCalendarAccessToken: credentials.access_token,
        googleCalendarRefreshToken: credentials.refresh_token,
        googleCalendarTokenExpiresAt: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(userIntegrations.userId, userId));
    oauth2Client.setCredentials(credentials);
    return google.calendar({ version: 'v3', auth: oauth2Client });
  };
  // GET /google/calendar/events - List events
  app.get('/events/list', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;
    try {
      const calendar = await getCalendarClient(userId);
      const now = new Date();
      const year = now.getFullYear();
      const timeMin = new Date(year, 0, 1, 0, 0, 0, 0).toISOString();
      const timeMax = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();
      const calendarListRes = await calendar.calendarList.list();
      const calendars = calendarListRes.data.items || [];
      const colorsRes = await calendar.colors.get();
      const calendarColors = colorsRes.data.calendar || {};
      const allEvents = await Promise.all(
        calendars
          .filter((cal) => typeof cal.id === 'string')
          .map(async (cal) => {
            const res = await calendar.events.list({
              calendarId: cal.id as string,
              timeMin,
              timeMax,
              singleEvents: true,
              orderBy: 'startTime',
              maxResults: 2500,
            });
            let _color: { background: string; foreground: string } = {
              background: '',
              foreground: '',
            };
            if (cal.backgroundColor) {
              _color.background = cal.backgroundColor;
              _color.foreground = cal.foregroundColor || '#000000';
            } else if (
              cal.colorId &&
              typeof cal.colorId === 'string' &&
              calendarColors[cal.colorId]
            ) {
              _color = {
                background: calendarColors[cal.colorId].background as string,
                foreground: calendarColors[cal.colorId].foreground as string,
              };
            }
            return (res.data.items || []).map((event) => ({
              ...event,
              calendarId: cal.id,
              _color,
            }));
          })
      );
      // Achata o array de arrays
      const flatEvents = allEvents.flat();
      return reply.code(200).send(flatEvents);
    } catch (error) {
      app.log.error(error, 'Error listing Google Calendar events');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
  // POST /google/calendar/events - Create event
  app.post(
    '/events/create',
    {
      schema: {
        body: createGoogleCalendarEventSchema,
      },
    },
    async (request, reply) => {
      const userId = (request as { user: { sub: string } }).user.sub;
      const event = request.body as TCreateGoogleCalendarEvent;
      try {
        const calendar = await getCalendarClient(userId);
        const res = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        });
        return reply.code(201).send(res.data);
      } catch (error) {
        app.log.error(error, 'Error creating Google Calendar event');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  // PUT /google/calendar/events/:eventId - Update event
  app.put(
    '/events/update/:eventId',
    {
      schema: {
        body: updateGoogleCalendarEventSchema,
      },
    },
    async (request, reply) => {
      const userId = (request as { user: { sub: string } }).user.sub;
      const { eventId } = request.params as { eventId: string };
      const event = request.body as TUpdateGoogleCalendarEvent;
      try {
        const calendar = await getCalendarClient(userId);
        const res = await calendar.events.update({
          calendarId: 'primary',
          eventId,
          requestBody: event,
        });
        return reply.code(200).send(res.data);
      } catch (error) {
        app.log.error(error, 'Error updating Google Calendar event');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
  // DELETE /google/calendar/events/:eventId - Delete event
  app.delete('/events/delete/:eventId', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;
    const { eventId } = request.params as { eventId: string };
    try {
      const calendar = await getCalendarClient(userId);
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });
      return reply.code(204).send();
    } catch (error) {
      app.log.error(error, 'Error deleting Google Calendar event');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });

  // GET /google/calendar/calendars - List calendars and their colors
  app.get('/calendars/list', async (request, reply) => {
    const userId = (request as { user: { sub: string } }).user.sub;
    try {
      const calendar = await getCalendarClient(userId);
      const calendarListRes = await calendar.calendarList.list();
      const colorsRes = await calendar.colors.get();

      const calendars = calendarListRes.data.items || [];
      const eventColors = colorsRes.data.event || {};
      const calendarColors = colorsRes.data.calendar || {};

      const formattedCalendars = calendars.map((cal) => ({
        id: cal.id,
        summary: cal.summary,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
        accessRole: cal.accessRole,
        // Add event and calendar colors if available
        eventColors,
        calendarColors,
      }));

      return reply.code(200).send(formattedCalendars);
    } catch (error) {
      app.log.error(error, 'Error listing Google Calendars and colors');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
}
