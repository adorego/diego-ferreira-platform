import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
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

const mockSession = {
  id: 10, patientId: 1, type: 'PLAN', status: 'PENDING',
  start: new Date('2026-06-01T10:00:00.000Z'), end: null,
  roomUrl: null, gcalEventId: null, recordingUrl: null,
  reminderSent: false, price: null, paymentId: null,
  createdAt: new Date('2026-05-01'),
  patient: mockPatient,
};

describe('PatientsService', () => {
  let service: PatientsService;
  let prismaMock: {
    user:    { findUnique: jest.Mock; count: jest.Mock; update: jest.Mock };
    session: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };
  let emailMock: { sendApproval: jest.Mock; sendRejection: jest.Mock };

  beforeEach(async () => {
    prismaMock = {
      user:    { findUnique: jest.fn(), count: jest.fn(), update: jest.fn() },
      session: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };
    emailMock = {
      sendApproval:  jest.fn().mockResolvedValue(undefined),
      sendRejection: jest.fn().mockResolvedValue(undefined),
    };

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
    it('cambia User.status a APPROVED, Session.status a CONFIRMED, y llama emailService.sendApproval con plan/fecha', async () => {
      prismaMock.session.findUnique.mockResolvedValue(mockSession);
      prismaMock.user.update.mockResolvedValue({ ...mockPatient, status: 'APPROVED' });
      prismaMock.session.update.mockResolvedValue({ ...mockSession, status: 'CONFIRMED' });

      await service.admitPatient({
        sessionId: 10, price: '100', sessions: 5, currency: 'PYG',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockPatient.id }, data: { status: 'APPROVED' } }),
      );
      expect(prismaMock.session.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 10 }, data: { status: 'CONFIRMED' } }),
      );
      expect(emailMock.sendApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockPatient.email,
          planLabel: 'Programa de coaching',
          sessionDate: expect.any(String),
        }),
      );

      // El JWT del link de pago debe llevar el monto/moneda reales que Diego cargó —
      // POST /payments/create-link los lee del propio payload, no de otro lado.
      const { paymentUrl } = emailMock.sendApproval.mock.calls[0][0];
      const token = new URL(paymentUrl).searchParams.get('token')!;
      const payload = jwt.verify(token, 'secret') as { patientId: number; amount: number; currency: string };
      expect(payload.amount).toBe(100);
      expect(payload.currency).toBe('PYG');
    });

    it('con sesión inexistente → lanza NotFoundException', async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(
        service.admitPatient({ sessionId: 999, price: '100', sessions: 1, currency: 'PYG' }),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(emailMock.sendApproval).not.toHaveBeenCalled();
    });

    it('con sesión ya CONFIRMED → no explota (aunque reenvía el email de aprobación)', async () => {
      // Nota: admitPatient() no chequea el status actual antes de actuar — si se
      // llama dos veces sobre la misma sesión, vuelve a mandar el email de
      // aprobación con un link de pago nuevo en vez de detectar el duplicado.
      // Documentado acá como comportamiento real, no como bug a corregir.
      const alreadyConfirmed = { ...mockSession, status: 'CONFIRMED' as const };
      prismaMock.session.findUnique.mockResolvedValue(alreadyConfirmed);
      prismaMock.user.update.mockResolvedValue({ ...mockPatient, status: 'APPROVED' });
      prismaMock.session.update.mockResolvedValue(alreadyConfirmed);

      await expect(
        service.admitPatient({ sessionId: 10, price: '100', sessions: 5, currency: 'PYG' }),
      ).resolves.toEqual(expect.objectContaining({ ok: true }));

      expect(emailMock.sendApproval).toHaveBeenCalledTimes(1);
    });
  });
});
