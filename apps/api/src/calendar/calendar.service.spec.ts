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
  });
});
