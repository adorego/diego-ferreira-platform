const mockResendSend = jest.fn().mockResolvedValue({ id: 'test-id' });

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html>test</html>'),
}));

jest.mock('@df/emails', () => ({
  SessionBookedEmail: jest.fn().mockReturnValue(null),
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockResendSend },
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  const cfgValues: Record<string, string> = {
    RESEND_API_KEY: 're_test',
    DIEGO_EMAIL:    'diego@test.com',
    ADMIN_URL:      'http://admin.test',
    FRONTEND_URL:   'http://frontend.test',
  };

  beforeEach(async () => {
    mockResendSend.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: { get: (k: string) => cfgValues[k] } },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('sendSessionBooked() llama resend con subject que contiene el nombre del paciente', async () => {
    await service.sendSessionBooked({
      patientName:  'Juan Pérez',
      patientEmail: 'juan@test.com',
      sessionDate:  '01/06/2026',
    });

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('Juan Pérez') }),
    );
  });

  it('sendApproval() llama resend con el to correcto', async () => {
    await service.sendApproval({
      to: 'patient@test.com', name: 'Juan',
      paymentUrl: 'http://pay.test', price: '100', currency: 'PYG',
    });

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'patient@test.com' }),
    );
  });

  it('sendReminder() con hoursUntil=1 → subject contiene "1 hora"', async () => {
    await service.sendReminder({
      to: 'p@test.com', name: 'Juan',
      sessionDate: '01/06/2026', roomUrl: 'https://meet.test',
      hoursUntil: 1,
    });

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('1 hora') }),
    );
  });

  it('sendReminder() con hoursUntil=24 → subject contiene "mañana"', async () => {
    await service.sendReminder({
      to: 'p@test.com', name: 'Juan',
      sessionDate: '01/06/2026', roomUrl: 'https://meet.test',
      hoursUntil: 24,
    });

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('mañana') }),
    );
  });

  it('sendWelcomeAfterPayment() llama resend', async () => {
    await service.sendWelcomeAfterPayment({
      to: 'p@test.com', name: 'Juan', calendarUrl: 'http://cal.test',
    });

    expect(mockResendSend).toHaveBeenCalled();
  });
});
