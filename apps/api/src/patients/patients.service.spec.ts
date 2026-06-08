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
  let prismaMock: { user: { findUnique: jest.Mock; count: jest.Mock; update: jest.Mock } };
  let emailMock: { sendApproval: jest.Mock };

  beforeEach(async () => {
    prismaMock = {
      user: { findUnique: jest.fn(), count: jest.fn(), update: jest.fn() },
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
  });
});
