import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarService } from '../calendar/calendar.service';

interface SchedulingPayload {
  sessionId:     number;
  userId:        number;
  email:         string;
  plan:          string;
  totalSessions: number;
  type:          string;
}

@Injectable()
export class SchedulingService {
  constructor(
    private cfg:      ConfigService,
    private prisma:   PrismaService,
    private calendar: CalendarService,
  ) {}

  private verify(token: string): SchedulingPayload {
    try {
      return jwt.verify(token, this.cfg.get('JWT_SECRET')!) as SchedulingPayload;
    } catch {
      throw new UnauthorizedException('Link de agendamiento inválido o expirado');
    }
  }

  async validate(token: string) {
    const payload = this.verify(token);
    const session = await this.prisma.session.findUnique({
      where:   { id: payload.sessionId },
      include: { patient: true, bookings: true },
    });
    if (!session) throw new UnauthorizedException('Sesión no encontrada');

    const bookedSessions = session.bookings.length;
    return {
      name:              session.patient.name,
      email:             session.patient.email,
      plan:              payload.plan,
      type:              payload.type,
      totalSessions:     payload.totalSessions,
      bookedSessions,
      remainingSessions: Math.max(payload.totalSessions - bookedSessions, 0),
    };
  }

  async book(token: string, start: string) {
    const payload = this.verify(token);
    const session = await this.prisma.session.findUnique({
      where:   { id: payload.sessionId },
      include: { patient: true, bookings: true },
    });
    if (!session) throw new UnauthorizedException('Sesión no encontrada');

    if (session.bookings.length >= payload.totalSessions) {
      throw new BadRequestException('Ya agendaste todas tus sesiones');
    }

    // SESSION_DURATION_* usan los nombres EXPLORATORY/COACHING pedidos — se mapean
    // acá al SessionType real del schema (EXPLORATORY/PLAN, no EXPLORATORY/COACHING).
    const isExploratory = payload.type === 'EXPLORATORY';
    const durationMin = Number(this.cfg.get(
      isExploratory ? 'SESSION_DURATION_EXPLORATORY_MIN' : 'SESSION_DURATION_COACHING_MIN',
    ) ?? (isExploratory ? 60 : 90));

    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }
    const endDate = new Date(startDate.getTime() + durationMin * 60_000);

    // Verifica disponibilidad real en Google Calendar (no solo confía en lo que
    // mandó el cliente) — mismo mecanismo de eventos "DISPONIBLE"/"Sesion" que usa
    // /agendar, pero acá con un chequeo de solapamiento de rango completo en vez del
    // matching por slot horario exacto que hace el frontend de /agendar (necesario
    // porque acá la duración puede ser 60 o 90 min, no siempre una hora redonda).
    const { events, eventsOccupied } = await this.calendar.getAvailability();
    const fitsInAvailableBlock = events.some(e => {
      const evStart = new Date(e.start);
      const evEnd   = new Date(e.end);
      return startDate >= evStart && endDate <= evEnd;
    });
    const overlapsOccupied = eventsOccupied.some(e => {
      const evStart = new Date(e.start).getTime();
      const evEnd   = new Date(e.end).getTime();
      return startDate.getTime() < evEnd && endDate.getTime() > evStart;
    });
    if (!fitsInAvailableBlock || overlapsOccupied) {
      throw new BadRequestException('El horario elegido ya no está disponible. Elegí otro.');
    }

    // Reusa CalendarService.createEvent tal cual lo usa /agendar — crea un evento
    // NUEVO con Google Meet (conferenceData), no "actualiza" el bloque DISPONIBLE:
    // ese bloque queda en el calendario como estaba, es solo lo que se usa para
    // calcular disponibilidad. Igual que en /agendar, no es un bug de este módulo.
    const result = await this.calendar.createEvent({
      summary:     `Sesion ${isExploratory ? 'Exploratoria' : 'Coaching'} - ${session.patient.name}`,
      description: `Paciente: ${session.patient.name} | Email: ${session.patient.email}`,
      start:       startDate.toISOString(),
      end:         endDate.toISOString(),
      attendees:   [{ email: session.patient.email, name: session.patient.name }],
      type:        isExploratory ? 'exploratory' : 'coaching',
      sessionId:   session.id,
    });

    await this.prisma.sessionBooking.create({
      data: {
        sessionId:     session.id,
        googleEventId: result.eventId!,
        meetLink:      result.meetLink ?? undefined,
        start:         startDate,
        end:           endDate,
        type:          payload.type,
      },
    });

    return {
      eventId:  result.eventId,
      meetLink: result.meetLink,
      start:    startDate.toISOString(),
      end:      endDate.toISOString(),
    };
  }
}
