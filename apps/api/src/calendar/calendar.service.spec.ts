const mockEventsList   = jest.fn();
const mockEventsInsert = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    calendar: jest.fn().mockReturnValue({
      events: {
        list:   mockEventsList,
        insert: mockEventsInsert,
      },
    }),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CalendarService } from './calendar.service';
import { PrismaService } from '../prisma/prisma.service';

const cfgValues: Record<string, string> = {
  GOOGLE_CLIENT_ID:     'client_id',
  GOOGLE_CLIENT_SECRET: 'client_secret',
  GOOGLE_REFRESH_TOKEN: 'refresh_token',
  GOOGLE_CALENDAR_ID:   'calendar_id',
};

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(async () => {
    mockEventsList.mockReset();
    mockEventsInsert.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        { provide: ConfigService, useValue: { get: (k: string) => cfgValues[k] } },
        { provide: PrismaService, useValue: { session: { update: jest.fn() } } },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  describe('getAvailability()', () => {
    it('retorna { events: [], eventsOccupied: [] } cuando no hay eventos', async () => {
      mockEventsList.mockResolvedValue({ data: { items: [] } });

      const result = await service.getAvailability();

      expect(result).toEqual({ events: [], eventsOccupied: [] });
      expect(mockEventsList).toHaveBeenCalledTimes(2);
    });

    it('con Google Calendar configurado y eventos reales → mapea slots libres y ocupados', async () => {
      mockEventsList
        .mockResolvedValueOnce({
          data: { items: [{ id: 'free-1', summary: 'DISPONIBLE', start: { dateTime: '2026-06-01T10:00:00' }, end: { dateTime: '2026-06-01T11:00:00' } }] },
        })
        .mockResolvedValueOnce({
          data: { items: [{ id: 'busy-1', summary: 'Sesion Juan', start: { dateTime: '2026-06-02T10:00:00' }, end: { dateTime: '2026-06-02T11:00:00' } }] },
        });

      const result = await service.getAvailability();

      expect(result.events).toEqual([
        { id: 'free-1', title: 'DISPONIBLE', start: '2026-06-01T10:00:00', end: '2026-06-01T11:00:00' },
      ]);
      expect(result.eventsOccupied).toEqual([
        { id: 'busy-1', title: 'Sesion Juan', start: '2026-06-02T10:00:00', end: '2026-06-02T11:00:00' },
      ]);
    });

    it('sin credenciales de Google configuradas → retorna vacío sin llamar a la API', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CalendarService,
          { provide: ConfigService, useValue: { get: () => undefined } },
          { provide: PrismaService, useValue: { session: { update: jest.fn() } } },
        ],
      }).compile();
      const unconfiguredService = module.get<CalendarService>(CalendarService);

      const result = await unconfiguredService.getAvailability();

      expect(result).toEqual({ events: [], eventsOccupied: [] });
      expect(mockEventsList).not.toHaveBeenCalled();
    });
  });

  describe('createEvent()', () => {
    it('retorna eventId, meetLink y htmlLink', async () => {
      mockEventsInsert.mockResolvedValue({
        data: {
          id:      'evt123',
          htmlLink:'https://cal.google.com/evt',
          conferenceData: {
            entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/abc' }],
          },
        },
      });

      const result = await service.createEvent({
        summary:     'Test',
        description: 'Test event',
        start:       '2026-06-01T10:00:00',
        end:         '2026-06-01T11:00:00',
        attendees:   [{ email: 'p@test.com', name: 'Juan' }],
        type:        'exploratory',
      });

      expect(result.eventId).toBe('evt123');
      expect(result.meetLink).toBe('https://meet.google.com/abc');
      expect(result.htmlLink).toBe('https://cal.google.com/evt');
    });

    // BUG REAL (no corregido, solo documentado): a diferencia de getAvailability(),
    // createEvent() no valida que las credenciales de Google estén configuradas antes
    // de llamar a la API, y no tiene try/catch alrededor de cal.events.insert(). Si la
    // API de Google falla (por credenciales inválidas/faltantes u otro motivo), el
    // error se propaga sin controlar — este test documenta ese comportamiento real,
    // no uno "controlado" como pedía el checklist original.
    it('si la API de Google falla (p.ej. por credenciales inválidas) → el error se propaga sin controlar', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CalendarService,
          { provide: ConfigService, useValue: { get: () => undefined } },
          { provide: PrismaService, useValue: { session: { update: jest.fn() } } },
        ],
      }).compile();
      const unconfiguredService = module.get<CalendarService>(CalendarService);

      mockEventsInsert.mockRejectedValue(new Error('invalid_grant'));

      await expect(
        unconfiguredService.createEvent({
          summary: 'Test', description: 'Test', start: '2026-06-01T10:00:00', end: '2026-06-01T11:00:00',
          attendees: [{ email: 'p@test.com', name: 'Juan' }], type: 'exploratory',
        }),
      ).rejects.toThrow('invalid_grant');
    });
  });
});
