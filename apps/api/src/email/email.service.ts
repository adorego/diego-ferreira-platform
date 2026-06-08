import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

// ─── Helpers HTML ────────────────────────────────────────────────────────────

function btn(text: string, url: string, color = '#EBBF01'): string {
  const fg = color === '#EBBF01' ? '#111111' : '#ffffff';
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0 8px;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="background:${color};border-radius:50px;mso-padding-alt:0;">
                <a href="${url}"
                   style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;
                          font-size:15px;font-weight:700;color:${fg};text-decoration:none;
                          border-radius:50px;letter-spacing:0.02em;">
                  ${text}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:24px 0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px;width:100%;background:#ffffff;
               border-radius:12px;overflow:hidden;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:28px 32px;">
              <p style="margin:0;font-size:20px;font-weight:900;color:#ffffff;letter-spacing:0.05em;">
                DIEGO <span style="color:#EBBF01;">FERREIRA</span>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.45);
                         letter-spacing:0.12em;text-transform:uppercase;">
                Psicólogo Deportivo &amp; Alto Rendimiento Mental
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 32px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
                © 2025 Diego Ferreira · Todos los derechos reservados<br/>
                <span style="font-size:11px;">Si no solicitaste este email, podés ignorarlo.</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Servicio ────────────────────────────────────────────────────────────────

@Injectable()
export class EmailService {
  private _resend: Resend | null = null;
  private from = 'Diego Ferreira <noreply@diegoferreira.org>';

  constructor(private cfg: ConfigService) {}

  /** Lazy init — evita crash al arrancar si RESEND_API_KEY no está configurado */
  private get resend(): Resend {
    if (!this._resend) {
      const key = this.cfg.get<string>('RESEND_API_KEY') ?? 're_placeholder';
      this._resend = new Resend(key);
    }
    return this._resend;
  }

  // ── Nueva sesión agendada (notificación a Diego) ──────────────────────────

  async sendSessionBooked(data: {
    patientName: string;
    patientEmail: string;
    sessionDate: string;
    sessionType?: 'exploratory' | 'plan';
  }) {
    const isExploratory = data.sessionType !== 'plan';
    const title = isExploratory
      ? 'Nueva sesión exploratoria agendada'
      : 'Nueva sesión de coaching agendada';
    const adminUrl = this.cfg.get<string>('ADMIN_URL') ?? '';

    const content = `
      <h2 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#111111;">${title}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;
                     color:#888888;width:120px;">Paciente</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;
                     font-weight:600;color:#111111;">${data.patientName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888888;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111111;">
            <a href="mailto:${data.patientEmail}" style="color:#00727A;">${data.patientEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#888888;">Fecha</td>
          <td style="padding:10px 0;font-size:14px;font-weight:600;color:#111111;">${data.sessionDate}</td>
        </tr>
      </table>
      ${btn('Ver en el dashboard', adminUrl, '#00727A')}`;

    await this.resend.emails.send({
      from:    this.from,
      to:      this.cfg.get<string>('DIEGO_EMAIL')!,
      subject: `Nueva sesión: ${data.patientName}`,
      html:    baseTemplate(content),
    });
  }

  // ── Aprobación + link de pago ──────────────────────────────────────────────

  async sendApproval(data: {
    to: string;
    name: string;
    paymentUrl: string;
    price: string;
    currency: string;
    sessions?: number;
  }) {
    const sessionsLine = data.sessions
      ? `<p style="margin:8px 0 0;font-size:14px;color:#444444;">
           Sesiones incluidas: <strong>${data.sessions}</strong>
         </p>`
      : '';

    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        ¡Tu solicitud fue aprobada! 🎉
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">
        Hola <strong>${data.name}</strong>, tu solicitud para el programa de coaching
        fue aprobada. El siguiente paso es completar el pago para reservar tu lugar.
      </p>
      <div style="background:#f9f9f9;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#111111;">
          ${data.currency} ${data.price}
        </p>
        ${sessionsLine}
      </div>
      <div style="border-left:4px solid #EBBF01;padding:12px 20px;background:#fffbeb;
                  border-radius:0 8px 8px 0;margin-bottom:8px;">
        <p style="margin:0;font-size:13px;color:#6b5b00;line-height:1.5;">
          ⏱ <strong>Este link expira en 48 horas.</strong><br/>
          Completá el pago antes de que venza para asegurar tu lugar.
        </p>
      </div>
      ${btn('Completar pago', data.paymentUrl)}`;

    await this.resend.emails.send({
      from:    this.from,
      to:      data.to,
      subject: 'Tu solicitud fue aprobada — completá tu pago',
      html:    baseTemplate(content),
    });
  }

  // ── Recordatorio de sesión ────────────────────────────────────────────────

  async sendReminder(data: {
    to: string;
    name: string;
    sessionDate: string;
    meetLink?: string;
    roomUrl?: string;    // alias legacy
    hoursUntil: 1 | 24;
  }) {
    const link   = data.meetLink ?? data.roomUrl ?? '';
    const subject = data.hoursUntil === 1
      ? 'Tu sesión empieza en 1 hora'
      : 'Recordatorio: sesión mañana';
    const urgency = data.hoursUntil === 1
      ? '⏰ Tu sesión <strong>empieza en 1 hora</strong>.'
      : '📅 Recordatorio: tenés una sesión <strong>mañana</strong>.';

    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        Recordatorio de sesión
      </h2>
      <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.6;">
        Hola <strong>${data.name}</strong>, ${urgency}
      </p>
      <div style="background:#f9f9f9;border-radius:10px;padding:18px 24px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#888888;">Fecha y hora</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111111;">${data.sessionDate}</p>
      </div>
      ${btn('Entrar a Google Meet', link, '#00727A')}
      <p style="margin:24px 0 0;font-size:12px;color:#bbbbbb;text-align:center;">
        Si necesitás cancelar o reagendar, contactá a Diego con al menos 24 hs de anticipación.
      </p>`;

    await this.resend.emails.send({
      from:    this.from,
      to:      data.to,
      subject,
      html:    baseTemplate(content),
    });
  }

  // ── Bienvenida post-pago ───────────────────────────────────────────────────

  async sendWelcomeAfterPayment(data: {
    to: string;
    name: string;
    sessions?: number;
    calendarUrl: string;
  }) {
    const sessionsText = data.sessions
      ? `Tenés <strong>${data.sessions} sesiones</strong> disponibles para agendar.`
      : 'Tus sesiones están listas para agendar.';

    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        ¡Pago confirmado! ✅
      </h2>
      <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.6;">
        Hola <strong>${data.name}</strong>, tu pago fue procesado exitosamente.
        ¡Bienvenido al programa de coaching de alto rendimiento!
      </p>
      <div style="background:#f0fdf4;border-radius:10px;padding:18px 24px;
                  border:1px solid #bbf7d0;margin-bottom:24px;">
        <p style="margin:0;font-size:15px;color:#166534;line-height:1.5;">
          ${sessionsText} Elegí los días y horarios que mejor se adapten a tu rutina.
        </p>
      </div>
      ${btn('Agendar mis sesiones', data.calendarUrl)}
      <p style="margin:24px 0 0;font-size:13px;color:#888888;line-height:1.6;">
        Diego se va a poner en contacto en las próximas 24 horas para coordinar los detalles del programa.
      </p>`;

    await this.resend.emails.send({
      from:    this.from,
      to:      data.to,
      subject: 'Pago confirmado — agendá tus sesiones',
      html:    baseTemplate(content),
    });
  }
}
