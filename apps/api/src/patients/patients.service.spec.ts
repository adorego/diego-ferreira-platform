import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PatientsService } from './patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const mockPatient = {
  id: 1,
  email: 'p@test.com',
  name: 'Juan',
  passwordHash: 'hash',
  role: 'PATIENT' as const,
  status: 'PROSPECT' as const,
  country: 'PY',
  gcalToken: null,
  createdAt: '2026-06-01T00:00:00.000Z' as any,
  sessions: [],
  payments: [],
};

describe('PatientsService', () => {
  let service: PatientsService;
  let prismaMock: {
    user:    { findUnique: jest.Mock; count: jest.Mock; update: jest.Mock };
    session: { findMany: jest.Mock };
  };
  let emailMock: { sendApproval: jest.Mock };

  beforeEach(async () => {
    prismaMock = {
      user:    { findUnique: jest.fn(), count: jest.fn(), update: jest.fn() },
      session: { findMany: jest.fn() },
    };
    emailMock = { sendApproval: jest.fn().mockResolvedValue(undefined) };

    const cfgValues: Record<string, string> = {
      JWT_SECRET:    'secret',
      FRONTEND_URL:  'http://frontend.test',
      ADMIN_URL:     'http://admin.test',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService, useValue: emailMock },
        { provide: ConfigService, useValue: { get: (k: string) => cfgValues[k] } },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  describe('findByEmail()', () => {
    it('retorna paciente con sesiones cuando existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPatient);

      const result = await service.findByEmail('p@test.com');

      expect(result.email).toBe('p@test.com');
      expect(result.sessions).toEqual([]);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findByEmail('noexiste@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exists()', () => {
    it('retorna { exists: true } cuando el email existe', async () => {
      prismaMock.user.count.mockResolvedValue(1);
      expect(await service.exists('p@test.com')).toEqual({ exists: true });
    });

    it('retorna { exists: false } cuando el email no existe', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      expect(await service.exists('nuevo@test.com')).toEqual({ exists: false });
    });
  });

  describe('getAllSessions()', () => {
    it('retorna las sesiones con paciente y resumen incluidos', async () => {
      const session = {
        id: 1, patientId: 1, type: 'PLAN', status: 'CONFIRMED',
        start: new Date('2026-06-01T10:00:00.000Z'), end: null,
        roomUrl: null, gcalEventId: null, recordingUrl: null,
        reminderSent: false, price: null, paymentId: null,
        createdAt: new Date('2026-05-01'),
        patient: mockPatient,
        summary: null,
      };
      prismaMock.session.findMany.mockResolvedValue([session]);

      const result = await service.getAllSessions();

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { patient: true, summary: true },
        }),
      );
      expect(result).toEqual([session]);
    });
  });

  describe('admitPatient()', () => {
    it('cambia status a APPROVED y llama emailService.sendApproval', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockPatient);
      prismaMock.user.update.mockResolvedValue({ ...mockPatient, status: 'APPROVED' });

      await service.admitPatient({
        email: 'p@test.com', name: 'Juan',
        price: '100', sessions: 5, currency: 'PYG',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'APPROVED' } }),
      );
      expect(emailMock.sendApproval).toHaveBeenCalled();
    });

    it('con paciente inexistente → lanza NotFoundException', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.admitPatient({ email: 'noexiste@test.com', name: 'X', price: '100', sessions: 1, currency: 'PYG' }),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(emailMock.sendApproval).not.toHaveBeenCalled();
    });

    it('con paciente ya APPROVED → no explota (aunque reenvía el email de aprobación)', async () => {
      // Nota: admitPatient() no chequea el status actual antes de actuar — si se
      // llama dos veces sobre el mismo paciente, vuelve a mandar el email de
      // aprobación con un link de pago nuevo en vez de detectar el duplicado.
      // Documentado acá como comportamiento real, no como bug a corregir.
      const alreadyApproved = { ...mockPatient, status: 'APPROVED' as const };
      prismaMock.user.findUnique.mockResolvedValue(alreadyApproved);
      prismaMock.user.update.mockResolvedValue(alreadyApproved);

      await expect(
        service.admitPatient({ email: 'p@test.com', name: 'Juan', price: '100', sessions: 5, currency: 'PYG' }),
      ).resolves.toEqual(expect.objectContaining({ ok: true }));

      expect(emailMock.sendApproval).toHaveBeenCalledTimes(1);
    });
  });
});
