import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(
    private cfg: ConfigService,
    private prisma: PrismaService,
  ) {}

  private getClient() {
    const auth = new google.auth.OAuth2(
      this.cfg.get('GOOGLE_CLIENT_ID'),
      this.cfg.get('GOOGLE_CLIENT_SECRET'),
    );
    auth.setCredentials({
      refresh_token: this.cfg.get('GOOGLE_REFRESH_TOKEN'),
    });
    return google.calendar({ version: 'v3', auth });
  }

  async getAvailability() {
    const clientId     = this.cfg.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.cfg.get<string>('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.cfg.get<string>('GOOGLE_REFRESH_TOKEN');
    const calendarId   = this.cfg.get<string>('GOOGLE_CALENDAR_ID');

    if (!clientId || !clientSecret || !refreshToken || !calendarId) {
      console.warn('[CalendarService] Google Calendar no configurado — retornando vacío');
      return { events: [], eventsOccupied: [] };
    }

    try {
      const cal = this.getClient();
      const now = new Date();
      const max = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const [free, busy] = await Promise.all([
        cal.events.list({
          calendarId,
          timeMin:      now.toISOString(),
          timeMax:      max.toISOString(),
          singleEvents: true,
          orderBy:      'startTime',
          q:            'DISPONIBLE',
        }),
        cal.events.list({
          calendarId,
          timeMin:      now.toISOString(),
          timeMax:      max.toISOString(),
          singleEvents: true,
          orderBy:      'startTime',
          q:            'Sesion',
        }),
      ]);

      const mapEvent = (e: any) => ({
        id:    e.id,
        title: e.summary,
        start: e.start?.dateTime ?? e.start?.date,
        end:   e.end?.dateTime   ?? e.end?.date,
      });

      return {
        events:         (free.data.items ?? []).map(mapEvent),
        eventsOccupied: (busy.data.items ?? []).map(mapEvent),
      };
    } catch (error: any) {
      console.error('[CalendarService] Error al obtener disponibilidad:', error?.message);
      return { events: [], eventsOccupied: [] };
    }
  }

  async createEvent(payload: {
  summary:     string
  description: string
  start:       string
  end:         string
  attendees:   { email: string; name: string }[]
  type:        string
  sessionId?:  number
  }) {
  const cal = this.getClient()

  const event = await cal.events.insert({
    calendarId:            this.cfg.get('GOOGLE_CALENDAR_ID'),
    sendUpdates:           'all',
    conferenceDataVersion: 1,        // ← esto activa Google Meet
    requestBody: {
      summary: `Sesion ${payload.type === 'exploratory'
        ? 'Exploratoria' : 'Coaching'} - ${payload.attendees[0]?.name}`,
      description: payload.description,
      start: { dateTime: payload.start, timeZone: 'America/Asuncion' },
      end:   { dateTime: payload.end,   timeZone: 'America/Asuncion' },
      attendees: payload.attendees.map(a => ({
        email: a.email, displayName: a.name,
      })),
      conferenceData: {
        createRequest: {
          requestId:             `df-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  })

  // Extraer el link de Meet del evento creado
  const meetLink =
    event.data.conferenceData?.entryPoints?.find(
      e => e.entryPointType === 'video'
    )?.uri ?? null

  // Guardar el meetLink en la sesión correspondiente
  // (necesitás el sessionId en el payload para esto)
  if (payload.sessionId && meetLink) {
    await this.prisma.session.update({
      where: { id: payload.sessionId },
      data:  { roomUrl: meetLink },
    })
  }

  return {
    eventId:  event.data.id,
    meetLink,
    htmlLink: event.data.htmlLink,  // link al evento en Google Calendar
  }
}
}