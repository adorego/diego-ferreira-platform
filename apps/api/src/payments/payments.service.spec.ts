import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaMock: {
    payment: { create: jest.Mock; update: jest.Mock };
    user:    { update: jest.Mock };
  };
  let emailMock: { sendWelcomeAfterPayment: jest.Mock };
  let fetchMock: jest.Mock;

  const cfgValues: Record<string, string> = {
    BANCARD_PRIVATE_KEY: 'priv_key',
    BANCARD_PUBLIC_KEY:  'pub_key',
    BANCARD_BASE_URL:    'https://vpos.infonet.com.py',
    FRONTEND_URL:        'http://frontend.test',
  };

  beforeEach(async () => {
    prismaMock = {
      payment: { create: jest.fn(), update: jest.fn() },
      user:    { update: jest.fn() },
    };
    emailMock = { sendWelcomeAfterPayment: jest.fn().mockResolvedValue(undefined) };
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService,  useValue: emailMock },
        { provide: ConfigService, useValue: { get: (k: string) => cfgValues[k] } },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPaymentLink()', () => {
    it('genera hash MD5 (32 chars hex) y llama fetch a Bancard API', async () => {
      fetchMock.mockResolvedValue({ json: () => Promise.resolve({ status: 'success' }) });
      prismaMock.payment.create.mockResolvedValue({});

      const result = await service.createPaymentLink(1, 100, 'PYG');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/single_buy'),
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.operation.token).toMatch(/^[a-f0-9]{32}$/);
      expect(result.processId).toBeDefined();
    });
  });

  describe('handleWebhook()', () => {
    it('con response="S" → actualiza payment a CONFIRMED y user a ACTIVE', async () => {
      prismaMock.payment.update.mockResolvedValue({
        patientId: 1,
        patient: { email: 'p@test.com', name: 'Juan' },
      });
      prismaMock.user.update.mockResolvedValue({});

      const result = await service.handleWebhook({
        operation: { shop_process_id: 'DF-123', response: 'S', authorization_number: 'AUTH1' },
      });

      expect(prismaMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'CONFIRMED' }) }),
      );
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ACTIVE' } }),
      );
      expect(result).toEqual({ ok: true });
    });

    it('con response!="S" → retorna { ok: false } sin actualizar DB', async () => {
      const result = await service.handleWebhook({
        operation: { shop_process_id: 'DF-123', response: 'N', authorization_number: null },
      });

      expect(result).toEqual({ ok: false });
      expect(prismaMock.payment.update).not.toHaveBeenCalled();
    });
  });
});
