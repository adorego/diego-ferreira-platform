import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService }  from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private cfg:    ConfigService,
    private prisma: PrismaService,
    private email:  EmailService,
  ) {}

  async createPaymentLink(patientId: number, amount: number, currency: string) {
    const shopProcessId = `DF-${Date.now()}-${patientId}`;
    const amountStr     = amount.toFixed(2);

    // Hash MD5 requerido por Bancard
    const token = crypto.createHash('md5')
      .update(
        this.cfg.get('BANCARD_PRIVATE_KEY') +
        shopProcessId + amountStr + currency,
      )
      .digest('hex');

    const body = {
      public_key: this.cfg.get('BANCARD_PUBLIC_KEY'),
      operation: {
        token,
        shop_process_id: shopProcessId,
        amount:          amountStr,
        currency,
        description:     'Sesiones de Coaching Diego Ferreira',
        return_url:
          `${this.cfg.get('FRONTEND_URL')}/pago/confirmacion`,
        cancel_url:
          `${this.cfg.get('FRONTEND_URL')}/pago/cancelado`,
      },
    };

    const res = await fetch(
      `${this.cfg.get('BANCARD_BASE_URL')}/vpos/api/0.3/single_buy`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body) },
    );
    const data = await res.json();
    if (data.status !== 'success')
      throw new BadRequestException(data.messages?.[0]?.dsc);

    await this.prisma.payment.create({
      data: { patientId, amount, currency, bancardProcessId: shopProcessId },
    });

    return { processId: shopProcessId };
  }

  // Webhook POST /payments/webhook — llamado por Bancard
  async handleWebhook(payload: any) {
    const { shop_process_id, response, authorization_number } =
      payload.operation ?? {};

    if (response !== 'S') return { ok: false };

    const payment = await this.prisma.payment.update({
      where: { bancardProcessId: shop_process_id },
      data:  { status: 'CONFIRMED', authNumber: authorization_number },
      include: { patient: true },
    });

    await this.prisma.user.update({
      where: { id: payment.patientId },
      data:  { status: 'ACTIVE' },
    });

    await this.email.sendWelcomeAfterPayment({
      to:          payment.patient.email,
      name:        payment.patient.name,
      calendarUrl: `${this.cfg.get('FRONTEND_URL')}/registrados`,
    });

    return { ok: true };
  }
}