import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const mockAuthService = { login: jest.fn() };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('retorna 200 y setea cookie access_token con body válido', async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: 'test_token',
        user: { id: 1, email: 'test@test.com', role: 'PATIENT' },
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('access_token');
      expect(res.body.user.email).toBe('test@test.com');
    });

    it('retorna 401 con credenciales inválidas', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('retorna 200, body { ok: true } y limpia la cookie access_token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(res.headers['set-cookie']).toBeDefined();
      // clearCookie() setea la cookie con Expires en el pasado para que el browser la borre
      expect(res.headers['set-cookie'][0]).toContain('access_token=;');
    });
  });

  describe('GET /auth/me', () => {
    it('retorna el payload que JwtGuard dejó en req.user', async () => {
      // El JwtGuard real hace `req.user = jwt.verify(token, ...)` (ver jwt.guard.ts) —
      // acá se simula ese efecto para no depender de un JWT real firmado.
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [{ provide: AuthService, useValue: mockAuthService }],
      })
        .overrideGuard(JwtGuard)
        .useValue({
          canActivate: (ctx: any) => {
            const req = ctx.switchToHttp().getRequest();
            req.user = { sub: '1', email: 'test@test.com', role: 'PATIENT' };
            return true;
          },
        })
        .compile();

      const meApp = moduleRef.createNestApplication();
      await meApp.init();

      const res = await request(meApp.getHttpServer()).get('/auth/me');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: { sub: '1', email: 'test@test.com', role: 'PATIENT' } });

      await meApp.close();
    });
  });
});
