import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const makeSession = (reminderSent = false) => ({
  id: 1,
  patientId: 1,
  start: '2026-06-01T14:00:00.000Z' as any,
  end:   '2026-06-01T15:00:00.000Z' as any,
  status: 'CONFIRMED' as const,
  reminderSent,
  roomUrl: 'https://meet.test',
  type: 'EXPLORATORY' as const,
  gcalEventId: null,
  recordingUrl: null,
  summary: null,
  price: null,
  paymentId: null,
  createdAt: '2026-06-01T00:00:00.000Z' as any,
  patient: {
    id: 1,
    email: 'p@test.com',
    name: 'Juan',
    passwordHash: 'h',
    role: 'PATIENT' as const,
    status: 'ACTIVE' as const,
    country: null,
    gcalToken: null,
    createdAt: '2026-06-01T00:00:00.000Z' as any,
  },
});

describe('RemindersService', () => {
  let service: RemindersService;
  let prismaMock: { session: { findMany: jest.Mock; update: jest.Mock } };
  let emailMock: { sendReminder: jest.Mock };

  beforeEach(async () => {
    prismaMock = { session: { findMany: jest.fn(), update: jest.fn() } };
    emailMock = { sendReminder: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService,  useValue: emailMock },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  it('sendReminders() llama email.sendReminder para sesiones en ventana de tiempo', async () => {
    prismaMock.session.findMany
      .mockResolvedValueOnce([makeSession()])
      .mockResolvedValueOnce([]);

    await service.sendReminders();

    expect(emailMock.sendReminder).toHaveBeenCalledTimes(1);
  });

  it('sendReminders() marca reminderSent=true después de enviar', async () => {
    prismaMock.session.findMany
      .mockResolvedValueOnce([makeSession()])
      .mockResolvedValueOnce([]);

    await service.sendReminders();

    expect(prismaMock.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { reminderSent: true } }),
    );
  });

  it('sendReminders() NO envía si no hay sesiones en la ventana', async () => {
    prismaMock.session.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await service.sendReminders();

    expect(emailMock.sendReminder).not.toHaveBeenCalled();
  });
});
