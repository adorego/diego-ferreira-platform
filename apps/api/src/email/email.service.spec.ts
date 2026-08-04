const mockGmailSend = jest.fn().mockResolvedValue({ data: { id: 'test-id' } });

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html>test</html>'),
}));

jest.mock('@df/emails', () => ({
  SessionBookedEmail: jest.fn().mockReturnValue(null),
}));

// Mismo patrón de mock que calendar.service.spec.ts para googleapis.
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    gmail: jest.fn().mockReturnValue({
      users: { messages: { send: mockGmailSend } },
    }),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

// gmail.users.messages.send() recibe { userId, requestBody: { raw } } — raw es el
// mensaje RFC 2822 completo en base64url, con el Subject a su vez codificado como
// MIME encoded-word (RFC 2047). Este helper deshace ambas capas para poder seguir
// afirmando sobre to/subject/html en texto plano, como antes con nodemailer.
function decodeSentMessage(callArgs: any): { to: string; from: string; subject: string; html: string } {
  const raw: string = callArgs.requestBody.raw;
  const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
  const message = Buffer.from(base64, 'base64').toString('utf-8');

  const to      = /^To: (.*)$/m.exec(message)?.[1] ?? '';
  const from    = /^From: (.*)$/m.exec(message)?.[1] ?? '';
  const rawSubject = /^Subject: (.*)$/m.exec(message)?.[1] ?? '';
  const encodedMatch = /^=\?UTF-8\?B\?(.*)\?=$/.exec(rawSubject);
  const subject = encodedMatch ? Buffer.from(encodedMatch[1], 'base64').toString('utf-8') : rawSubject;
  const html = message.split('\n\n').slice(1).join('\n\n');

  return { to, from, subject, html };
}

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
    mockGmailSend.mockClear();
    mockGmailSend.mockResolvedValue({ data: { id: 'test-id' } });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: { get: (k: string) => cfgValues[k] } },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('sendSessionBooked() manda un subject que contiene el nombre del paciente', async () => {
    await service.sendSessionBooked({
      patientName:  'Juan Pérez',
      patientEmail: 'juan@test.com',
      sessionDate:  '01/06/2026',
    });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.subject).toContain('Juan Pérez');
  });

  it('sendApproval() manda al destinatario correcto con el link de pago en el html', async () => {
    await service.sendApproval({
      to: 'patient@test.com', name: 'Juan',
      paymentUrl: 'http://pay.test/xyz', price: '100', currency: 'PYG',
    });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.to).toBe('patient@test.com');
    expect(sent.subject).toContain('confirmado');
    expect(sent.html).toContain('http://pay.test/xyz');
  });

  it('sendApproval() con planLabel y sessionDate → los incluye en el html', async () => {
    await service.sendApproval({
      to: 'patient@test.com', name: 'Juan',
      paymentUrl: 'http://pay.test/xyz', price: '100', currency: 'PYG',
      planLabel: 'Programa de coaching', sessionDate: '10 de agosto, 13:00',
    });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.html).toContain('Programa de coaching');
    expect(sent.html).toContain('10 de agosto, 13:00');
  });

  it('sendReminder() con hoursUntil=1 → subject contiene "1 hora" y el html tiene el meetLink', async () => {
    await service.sendReminder({
      to: 'p@test.com', name: 'Juan',
      sessionDate: '01/06/2026', roomUrl: 'https://meet.test/abc',
      hoursUntil: 1,
    });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.subject).toContain('1 hora');
    expect(sent.html).toContain('https://meet.test/abc');
  });

  it('sendReminder() con hoursUntil=24 → subject contiene "mañana"', async () => {
    await service.sendReminder({
      to: 'p@test.com', name: 'Juan',
      sessionDate: '01/06/2026', roomUrl: 'https://meet.test',
      hoursUntil: 24,
    });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.subject).toContain('mañana');
  });

  it('sendWelcomeAfterPayment() manda al destinatario correcto con el nombre del paciente en el html', async () => {
    await service.sendWelcomeAfterPayment({
      to: 'p@test.com', name: 'Juan Pérez', calendarUrl: 'http://cal.test',
    });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.to).toBe('p@test.com');
    expect(sent.html).toContain('Juan Pérez');
  });

  it('sendRejection() manda al destinatario correcto con el nombre del paciente en el html', async () => {
    await service.sendRejection({ to: 'p@test.com', name: 'Juan Pérez' });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.to).toBe('p@test.com');
    expect(sent.html).toContain('Juan Pérez');
  });

  it('sendBookDelivery() manda subject/html con el nombre y el link al PDF real', async () => {
    await service.sendBookDelivery('lector@test.com', 'Ana');

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.to).toBe('lector@test.com');
    expect(sent.subject).toBe('¡Tu libro ya está aquí, Ana! 📚');
    expect(sent.html).toContain('http://frontend.test/libro-diego-ferreira.pdf');
  });

  it('sendBookPurchaseConfirmation() manda al destinatario correcto', async () => {
    await service.sendBookPurchaseConfirmation({ to: 'lector@test.com' });

    const sent = decodeSentMessage(mockGmailSend.mock.calls[0][0]);
    expect(sent.to).toBe('lector@test.com');
  });

  // EmailService.send() envuelve todo gmail.users.messages.send() en Promise.race +
  // catch sin relanzar, precisamente para que una caída de la API de Gmail no tumbe
  // el webhook de pago ni el cron de recordatorios (los callers reales —
  // PaymentsService.handleWebhook, PatientsService.admitPatient/rejectSession,
  // RemindersService.sendReminders— siguen sin tener su propio try/catch, pero ya
  // no lo necesitan).
  it('si el envío falla → NO se propaga (el negocio sigue aunque el email falle)', async () => {
    mockGmailSend.mockRejectedValueOnce(new Error('Gmail API unavailable'));

    await expect(
      service.sendSessionBooked({
        patientName: 'Juan', patientEmail: 'juan@test.com', sessionDate: '01/06/2026',
      }),
    ).resolves.toBeUndefined();
  });

  it('si el envío tarda más de 10s → corta por timeout y no cuelga el caller', async () => {
    jest.useFakeTimers();
    mockGmailSend.mockReturnValueOnce(new Promise(() => {})); // nunca resuelve

    const pending = service.sendSessionBooked({
      patientName: 'Juan', patientEmail: 'juan@test.com', sessionDate: '01/06/2026',
    });

    await jest.advanceTimersByTimeAsync(10_000);
    await expect(pending).resolves.toBeUndefined();

    jest.useRealTimers();
  });
});
