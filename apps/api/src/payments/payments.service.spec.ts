import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaMock: {
    payment:      { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock };
    user:         { update: jest.Mock };
    bookPurchase: { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock };
  };
  let emailMock: { sendWelcomeAfterPayment: jest.Mock; sendBookPurchaseConfirmation: jest.Mock };
  let fetchMock: jest.Mock;

  const cfgValues: Record<string, string> = {
    BANCARD_PRIVATE_KEY: 'test_private_key',
    BANCARD_PUBLIC_KEY:  'pub_key',
    BANCARD_BASE_URL:    'https://vpos.infonet.com.py',
    FRONTEND_URL:        'http://frontend.test',
  };

  const SHOP_PROCESS_ID = 'DF-123';
  const AMOUNT   = '100.00';
  const CURRENCY = 'PYG';

  function validToken(): string {
    return crypto
      .createHash('md5')
      .update(
        cfgValues.BANCARD_PRIVATE_KEY + SHOP_PROCESS_ID + 'confirm' + AMOUNT + CURRENCY,
      )
      .digest('hex');
  }

  beforeEach(async () => {
    prismaMock = {
      payment:      { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
      user:         { update: jest.fn() },
      bookPurchase: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn().mockResolvedValue(null) },
    };
    emailMock = {
      sendWelcomeAfterPayment: jest.fn().mockResolvedValue(undefined),
      sendBookPurchaseConfirmation: jest.fn().mockResolvedValue(undefined),
    };
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
      expect(body.operation.iva_amount).toBe('0.00');
      expect(result.processId).toBeDefined();
    });
  });

  describe('createBookPaymentLink()', () => {
    it('con BOOK_AMOUNT/BOOK_CURRENCY sin configurar → usa el fallback 95000 PYG', async () => {
      fetchMock.mockResolvedValue({ json: () => Promise.resolve({ status: 'success' }) });
      prismaMock.bookPurchase.create.mockResolvedValue({});

      const result = await service.createBookPaymentLink('lector@test.com', 'Lector Test');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/single_buy'),
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.operation.token).toMatch(/^[a-f0-9]{32}$/);
      expect(body.operation.amount).toBe('95000');
      expect(body.operation.currency).toBe('PYG');
      expect(body.operation.description).toContain('Libro');
      expect(prismaMock.bookPurchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'lector@test.com',
            nombre: 'Lector Test',
            amount: '95000',
            currency: 'PYG',
          }),
        }),
      );
      expect(prismaMock.payment.create).not.toHaveBeenCalled();
      expect(result.processId).toBeDefined();
      expect(result.shopProcessId).toBe(result.processId);
    });

    it('con BOOK_AMOUNT/BOOK_CURRENCY configuradas → las usa en vez del fallback', async () => {
      const cfgWithBook = {
        ...cfgValues,
        BOOK_AMOUNT: '12.99',
        BOOK_CURRENCY: 'USD',
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PaymentsService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: EmailService,  useValue: emailMock },
          { provide: ConfigService, useValue: { get: (k: string) => (cfgWithBook as Record<string, string>)[k] } },
        ],
      }).compile();
      const usdService = module.get<PaymentsService>(PaymentsService);

      fetchMock.mockResolvedValue({ json: () => Promise.resolve({ status: 'success' }) });
      prismaMock.bookPurchase.create.mockResolvedValue({});

      await usdService.createBookPaymentLink('lector@test.com', 'Lector Test');

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.operation.amount).toBe('12.99');
      expect(body.operation.currency).toBe('USD');
    });
  });

  describe('handleWebhook()', () => {
    it('con firma MD5 inválida → retorna { status: "success" } sin activar al paciente', async () => {
      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'S',
          authorization_number: 'AUTH1',
          token: 'token_falsificado',
        },
      });

      expect(result).toEqual({ status: 'success' });
      expect(prismaMock.payment.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.payment.update).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(emailMock.sendWelcomeAfterPayment).not.toHaveBeenCalled();
    });

    it('con pago ya CONFIRMED → retorna { status: "success" } sin duplicar la activación', async () => {
      prismaMock.payment.findUnique.mockResolvedValue({
        patientId: 1,
        status: 'CONFIRMED',
        patient: { email: 'p@test.com', name: 'Juan' },
      });

      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'S',
          authorization_number: 'AUTH1',
          token: validToken(),
        },
      });

      expect(result).toEqual({ status: 'success' });
      expect(prismaMock.payment.update).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(emailMock.sendWelcomeAfterPayment).not.toHaveBeenCalled();
    });

    it('con shop_process_id inexistente → retorna { status: "success" } sin lanzar error 500', async () => {
      prismaMock.payment.findUnique.mockResolvedValue(null);

      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'S',
          authorization_number: 'AUTH1',
          token: validToken(),
        },
      });

      expect(result).toEqual({ status: 'success' });
      expect(prismaMock.payment.update).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('con response="N" → marca el pago como FAILED y retorna { status: "success" }', async () => {
      prismaMock.payment.findUnique.mockResolvedValue({
        patientId: 1,
        status: 'PENDING',
        patient: { email: 'p@test.com', name: 'Juan' },
      });

      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'N',
          response_code: '05',
          token: validToken(),
        },
      });

      expect(prismaMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'FAILED' } }),
      );
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(emailMock.sendWelcomeAfterPayment).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'success' });
    });

    it('con response="S" y firma válida → confirma el pago, activa al paciente y envía email', async () => {
      prismaMock.payment.findUnique.mockResolvedValue({
        patientId: 1,
        status: 'PENDING',
        patient: { email: 'p@test.com', name: 'Juan' },
      });

      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'S',
          authorization_number: 'AUTH1',
          token: validToken(),
        },
      });

      expect(prismaMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'CONFIRMED', authNumber: 'AUTH1' },
        }),
      );
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ACTIVE' } }),
      );
      expect(emailMock.sendWelcomeAfterPayment).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'p@test.com', name: 'Juan' }),
      );
      expect(result).toEqual({ status: 'success' });
    });

    it('compra de libro (BookPurchase) con response="S" → confirma y genera downloadToken', async () => {
      prismaMock.payment.findUnique.mockResolvedValue(null);
      prismaMock.bookPurchase.findUnique.mockResolvedValue({
        shopProcessId: SHOP_PROCESS_ID,
        status: 'PENDING',
      });

      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'S',
          authorization_number: 'AUTH1',
          token: validToken(),
        },
      });

      expect(prismaMock.bookPurchase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { shopProcessId: SHOP_PROCESS_ID },
          data: expect.objectContaining({
            status: 'CONFIRMED',
            downloadToken: expect.any(String),
          }),
        }),
      );
      expect(prismaMock.payment.update).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'success' });
    });

    it('compra de libro con response="N" → marca BookPurchase como FAILED', async () => {
      prismaMock.payment.findUnique.mockResolvedValue(null);
      prismaMock.bookPurchase.findUnique.mockResolvedValue({
        shopProcessId: SHOP_PROCESS_ID,
        status: 'PENDING',
      });

      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'N',
          response_code: '05',
          token: validToken(),
        },
      });

      expect(prismaMock.bookPurchase.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'FAILED' } }),
      );
      expect(result).toEqual({ status: 'success' });
    });

    it('compra de libro ya CONFIRMED → no duplica la confirmación', async () => {
      prismaMock.payment.findUnique.mockResolvedValue(null);
      prismaMock.bookPurchase.findUnique.mockResolvedValue({
        shopProcessId: SHOP_PROCESS_ID,
        status: 'CONFIRMED',
      });

      const result = await service.handleWebhook({
        operation: {
          shop_process_id: SHOP_PROCESS_ID,
          amount: AMOUNT,
          currency: CURRENCY,
          response: 'S',
          authorization_number: 'AUTH1',
          token: validToken(),
        },
      });

      expect(prismaMock.bookPurchase.update).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'success' });
    });
  });

  describe('downloadBook()', () => {
    it('con token inexistente → lanza NotFoundException', async () => {
      prismaMock.bookPurchase.findUnique.mockResolvedValue(null);

      await expect(service.downloadBook('token-invalido')).rejects.toThrow(NotFoundException);
      expect(prismaMock.bookPurchase.update).not.toHaveBeenCalled();
    });

    it('con status PENDING (no CONFIRMED) → lanza NotFoundException', async () => {
      prismaMock.bookPurchase.findUnique.mockResolvedValue({
        downloadToken: 'tok-1', status: 'PENDING',
      });

      await expect(service.downloadBook('tok-1')).rejects.toThrow(NotFoundException);
      expect(prismaMock.bookPurchase.update).not.toHaveBeenCalled();
    });

    it('con compra CONFIRMED → actualiza downloadedAt y retorna downloadUrl', async () => {
      prismaMock.bookPurchase.findUnique.mockResolvedValue({
        downloadToken: 'tok-1', status: 'CONFIRMED',
      });
      prismaMock.bookPurchase.update.mockResolvedValue({});

      const result = await service.downloadBook('tok-1');

      expect(prismaMock.bookPurchase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { downloadToken: 'tok-1' },
          data: expect.objectContaining({ downloadedAt: expect.any(Date) }),
        }),
      );
      expect(result).toEqual({ downloadUrl: '/libro-completo.pdf' });
    });
  });
});
