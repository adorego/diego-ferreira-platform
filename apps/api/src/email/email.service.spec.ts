const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html>test</html>'),
}));

jest.mock('@df/emails', () => ({
  SessionBookedEmail: jest.fn().mockReturnValue(null),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: mockSendMail,
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  const cfgValues: Record<string, string> = {
    GMAIL_CLIENT_ID:     'client-id-test',
    GMAIL_CLIENT_SECRET: 'client-secret-test',
    GMAIL_REFRESH_TOKEN: 'refresh-token-test',
    DIEGO_EMAIL:         'diego@test.com',
    ADMIN_URL:           'http://admin.test',
    FRONTEND_URL:        'http://frontend.test',
  };

  beforeEach(async () => {
    mockSendMail.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: { get: (k: string) => cfgValues[k] } },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('sendSessionBooked() llama sendMail con subject que contiene el nombre del paciente', async () => {
    await service.sendSessionBooked({
      patientName:  'Juan Pérez',
      patientEmail: 'juan@test.com',
      sessionDate:  '01/06/2026',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('Juan Pérez') }),
    );
  });

  it('sendApproval() llama sendMail con el to correcto y el link de pago en el html', async () => {
    await service.sendApproval({
      to: 'patient@test.com', name: 'Juan',
      paymentUrl: 'http://pay.test/xyz', price: '100', currency: 'PYG',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'patient@test.com',
        subject: expect.stringContaining('confirmado'),
        html: expect.stringContaining('http://pay.test/xyz'),
      }),
    );
  });

  it('sendApproval() con planLabel y sessionDate → los incluye en el html', async () => {
    await service.sendApproval({
      to: 'patient@test.com', name: 'Juan',
      paymentUrl: 'http://pay.test/xyz', price: '100', currency: 'PYG',
      planLabel: 'Programa de coaching', sessionDate: '10 de agosto, 13:00',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Programa de coaching'),
      }),
    );
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('10 de agosto, 13:00'),
      }),
    );
  });

  it('sendReminder() con hoursUntil=1 → subject contiene "1 hora" y el html tiene el meetLink', async () => {
    await service.sendReminder({
      to: 'p@test.com', name: 'Juan',
      sessionDate: '01/06/2026', roomUrl: 'https://meet.test/abc',
      hoursUntil: 1,
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('1 hora'),
        html: expect.stringContaining('https://meet.test/abc'),
      }),
    );
  });

  it('sendReminder() con hoursUntil=24 → subject contiene "mañana"', async () => {
    await service.sendReminder({
      to: 'p@test.com', name: 'Juan',
      sessionDate: '01/06/2026', roomUrl: 'https://meet.test',
      hoursUntil: 24,
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('mañana') }),
    );
  });

  it('sendWelcomeAfterPayment() llama sendMail con el to y el nombre del paciente en el html', async () => {
    await service.sendWelcomeAfterPayment({
      to: 'p@test.com', name: 'Juan Pérez', calendarUrl: 'http://cal.test',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'p@test.com',
        html: expect.stringContaining('Juan Pérez'),
      }),
    );
  });

  it('sendRejection() llama sendMail con el to y el nombre del paciente en el html', async () => {
    await service.sendRejection({ to: 'p@test.com', name: 'Juan Pérez' });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'p@test.com',
        html: expect.stringContaining('Juan Pérez'),
      }),
    );
  });

  it('sendBookPurchaseConfirmation() llama sendMail con el to correcto', async () => {
    await service.sendBookPurchaseConfirmation({ to: 'lector@test.com' });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'lector@test.com' }),
    );
  });

  // BUG REAL (no corregido, solo documentado): ningún método de EmailService envuelve
  // `this.transporter.sendMail(...)` en try/catch. Si Gmail SMTP falla o rechaza
  // (token expirado, límite de envío, etc.), el error se propaga sin controlar hacia
  // quien haya llamado al método — y ninguno de los callers reales
  // (PaymentsService.handleWebhook, PatientsService.admitPatient/rejectSession,
  // RemindersService.sendReminders) lo captura tampoco. Una caída del SMTP puede
  // tumbar un webhook de pago o el cron de recordatorios completo.
  it('si el envío falla → el error se propaga sin capturar (no hay try/catch)', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));

    await expect(
      service.sendSessionBooked({
        patientName: 'Juan', patientEmail: 'juan@test.com', sessionDate: '01/06/2026',
      }),
    ).rejects.toThrow('SMTP unavailable');
  });
});
