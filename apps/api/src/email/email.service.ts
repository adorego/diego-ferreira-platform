import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

interface MailOptions {
  from:    string;
  to:      string;
  subject: string;
  html:    string;
}

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
                <span style="font-size:11px;">
                  Contacto: <a href="mailto:diego@diegoferreira.coach" style="color:#999999;">diego@diegoferreira.coach</a>
                </span><br/>
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

const SEND_TIMEOUT_MS = 10_000;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private from = '"Diego Ferreira" <diego@diegoferreira.coach>';

  constructor(private cfg: ConfigService) {}

  // SMTP (puertos 465/587) sale bloqueado en Railway — el email quedaba en timeout
  // en todos los envíos sin importar el puerto. Gmail API vía HTTPS (443) esquiva el
  // bloqueo por completo. Mismo patrón que CalendarService para Google Calendar
  // (que ya funciona en este mismo proyecto/Railway): OAuth2 con refresh_token, sin
  // access_token fijo — la librería lo renueva sola.
  private getGmailClient() {
    const auth = new google.auth.OAuth2(
      this.cfg.get('GMAIL_CLIENT_ID'),
      this.cfg.get('GMAIL_CLIENT_SECRET'),
    );
    auth.setCredentials({
      refresh_token: this.cfg.get('GMAIL_REFRESH_TOKEN'),
    });
    return google.gmail({ version: 'v1', auth });
  }

  // Todo el envío pasa por acá en vez de armar el mensaje RFC 2822 en cada método —
  // Promise.race con timeout + catch-sin-relanzar una sola vez, no repetido 7 veces.
  // Antes un email colgado podía trabar el webhook de pago o el cron de recordatorios
  // completo; ahora el negocio sigue aunque el email falle o tarde más de 10s — el
  // error queda solo logueado.
  private async send(mailOptions: MailOptions): Promise<void> {
    // El setTimeout se limpia con .finally() sin importar quién gane la carrera —
    // si no, cada envío exitoso deja un timer de 10s colgado hasta que dispara solo
    // (inofensivo en producción, pero deja handles abiertos en los tests).
    let timeoutId!: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Email timeout')), SEND_TIMEOUT_MS);
    });

    // El Subject se codifica como MIME encoded-word (RFC 2047) — varios asuntos de
    // este archivo tienen tildes/símbolos ("...está confirmado ✓", "¡Pago...") y un
    // header RFC 2822 con UTF-8 crudo no es válido, más allá de que el mensaje
    // completo viaje en base64 hacia la API (esa es una capa de transporte distinta,
    // no reemplaza el encoding que necesita el header en sí).
    const encodedSubject = `=?UTF-8?B?${Buffer.from(mailOptions.subject).toString('base64')}?=`;

    const message = [
      `To: ${mailOptions.to}`,
      `From: ${mailOptions.from}`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      mailOptions.html,
    ].join('\n');

    const raw = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const gmailSend = this.getGmailClient().users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    await Promise.race([gmailSend, timeout])
      .finally(() => clearTimeout(timeoutId))
      .catch(err => {
        this.logger.error(`Error enviando email a ${String(mailOptions.to)}: ${err.message}`);
        // No relanzar — el flujo de negocio continúa aunque el email falle.
      });
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

    await this.send({
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
    planLabel?: string;
    sessionDate?: string;
  }) {
    const sessionsLine = data.sessions
      ? `<p style="margin:8px 0 0;font-size:14px;color:#444444;">
           Sesiones incluidas: <strong>${data.sessions}</strong>
         </p>`
      : '';
    const planLine = data.planLabel
      ? `<p style="margin:0 0 16px;font-size:15px;color:#444444;">
           Programa: <strong>${data.planLabel}</strong>
         </p>`
      : '';
    const dateBlock = data.sessionDate
      ? `<div style="background:#f9f9f9;border-radius:10px;padding:16px 24px;margin-bottom:16px;">
           <p style="margin:0;font-size:13px;color:#888888;">Primera sesión</p>
           <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111111;">${data.sessionDate}</p>
         </div>`
      : '';

    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        Tu programa está confirmado ✓
      </h2>
      <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.6;">
        Hola <strong>${data.name}</strong>, tu solicitud para el programa de coaching
        fue aprobada. El siguiente paso es completar el pago para reservar tu lugar.
      </p>
      ${planLine}
      ${dateBlock}
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
      ${btn('Completar pago →', data.paymentUrl)}`;

    await this.send({
      from:    this.from,
      to:      data.to,
      subject: 'Tu programa con Diego Ferreira está confirmado ✓',
      html:    baseTemplate(content),
    });
  }

  // ── Rechazo de solicitud ─────────────────────────────────────────────────

  async sendRejection(data: { to: string; name: string }) {
    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        Novedades sobre tu solicitud
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">
        Hola <strong>${data.name}</strong>, por el momento no podemos avanzar con tu
        solicitud para el programa de coaching. Si creés que se trata de un error o
        querés más información, respondé este email.
      </p>`;

    await this.send({
      from:    this.from,
      to:      data.to,
      subject: 'Novedades sobre tu solicitud',
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

    await this.send({
      from:    this.from,
      to:      data.to,
      subject,
      html:    baseTemplate(content),
    });
  }

  // ── Pago confirmado + link de agendamiento ─────────────────────────────────

  async sendPostPaymentScheduling(data: {
    to: string;
    name: string;
    planLabel: string;
    totalSessions: number;
    amount: string;
    currency: string;
    schedulingUrl: string;
  }) {
    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        ¡Pago confirmado! ✅
      </h2>
      <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.6;">
        Hola <strong>${data.name}</strong>, tu pago fue confirmado. Ya podés agendar
        tu${data.totalSessions > 1 ? 's sesiones' : ' sesión'} con Diego.
      </p>
      <div style="background:#f9f9f9;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:14px;color:#444444;">
          Programa: <strong>${data.planLabel}</strong>
        </p>
        <p style="margin:0 0 6px;font-size:14px;color:#444444;">
          Sesiones contratadas: <strong>${data.totalSessions}</strong>
        </p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#111111;">
          Monto pagado: ${data.currency} ${data.amount}
        </p>
      </div>
      ${btn('Agendar mi sesión →', data.schedulingUrl)}
      <p style="margin:24px 0 0;font-size:12px;color:#bbbbbb;text-align:center;">
        Este enlace es personal. Podés usarlo cuando quieras.
      </p>`;

    await this.send({
      from:    this.from,
      to:      data.to,
      subject: '¡Pago confirmado! Agendá tu sesión con Diego',
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

    await this.send({
      from:    this.from,
      to:      data.to,
      subject: 'Pago confirmado — agendá tus sesiones',
      html:    baseTemplate(content),
    });
  }

  // ── Compra del libro confirmada ────────────────────────────────────────────

  async sendBookPurchaseConfirmation(data: { to: string }) {
    // TODO(Diego): reemplazar este contenido genérico con la entrega real
    // (link de descarga del ebook, tracking de envío físico, etc.) una vez
    // definido el mecanismo de entrega del libro.
    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        ¡Gracias por tu compra! ✅
      </h2>
      <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.6;">
        Tu pago por <strong>Despertá y avanzá, ¡Carajo!</strong> fue confirmado.
        Diego se va a poner en contacto para coordinar la entrega de tu libro.
      </p>`;

    await this.send({
      from:    this.from,
      to:      data.to,
      subject: 'Compra confirmada — Despertá y avanzá, ¡Carajo!',
      html:    baseTemplate(content),
    });
  }

  // ── Entrega del libro (post-pago) ──────────────────────────────────────────
  // Reemplaza en la práctica a sendBookPurchaseConfirmation() de arriba — esa
  // quedó como contenido genérico sin nunca llamarse desde ningún flujo real
  // (su propio TODO decía "una vez definido el mecanismo de entrega del libro",
  // que es exactamente lo que este método ya hace). No se borró por las dudas
  // de que algo dependa de ella, pero es código muerto en este punto.

  async sendBookDelivery(to: string, name: string): Promise<void> {
    const webUrl = this.cfg.get<string>('WEB_URL') ?? this.cfg.get<string>('FRONTEND_URL') ?? '';
    const bookUrl = `${webUrl}/libro-diego-ferreira.pdf`;

    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111111;">
        ¡Hola ${name}!
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">
        Tu compra fue confirmada. Aquí está tu libro:
      </p>
      ${btn('Descargar libro →', bookUrl)}
      <p style="margin:20px 0 0;font-size:13px;color:#888888;text-align:center;word-break:break-all;">
        También podés acceder desde: <a href="${bookUrl}" style="color:#00727A;">${bookUrl}</a>
      </p>
      <hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0;" />
      <p style="margin:0;font-size:15px;color:#444444;text-align:center;">
        Gracias por confiar en Diego Ferreira
      </p>`;

    await this.send({
      from:    this.from,
      to,
      subject: `¡Tu libro ya está aquí, ${name}! 📚`,
      html:    baseTemplate(content),
    });
  }
}
