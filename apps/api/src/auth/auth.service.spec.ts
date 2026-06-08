import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUser = {
  id: 1,
  email: 'test@test.com',
  name: 'Test User',
  passwordHash: 'hashed_password',
  role: 'PATIENT' as const,
  status: 'ACTIVE' as const,
  country: null,
  gcalToken: null,
  createdAt: new Date('2026-06-01'),
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtMock: { sign: jest.Mock };

  beforeEach(async () => {
    prismaMock = { user: { findUnique: jest.fn(), create: jest.fn() } };
    jwtMock = { sign: jest.fn().mockReturnValue('test_token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login()', () => {
    it('retorna access_token y user con credenciales correctas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'password');

      expect(result.access_token).toBe('test_token');
      expect(result.user).toMatchObject({ id: 1, email: 'test@test.com', role: 'PATIENT' });
    });

    it('lanza UnauthorizedException con email inexistente', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login('noexiste@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException con password incorrecta', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createUser()', () => {
    it('crea usuario con password hasheada', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');
      prismaMock.user.create.mockResolvedValue({ ...mockUser, passwordHash: 'hashed_pass' });

      await service.createUser({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: 'hashed_pass' }),
        }),
      );
    });
  });
});
