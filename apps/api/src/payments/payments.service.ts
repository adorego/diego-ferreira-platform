import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService }  from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private cfg:    ConfigService,
    private prisma: PrismaService,
    private email:  EmailService,
  ) {}

  async createPaymentLink(patientId: number, amount: number, currency: string) {
    const shopProcessId = Date.now() % 999999999999999;
    const amountStr     = amount.toFixed(2);

    const token = crypto.createHash('md5')
      .update(
        this.cfg.get('BANCARD_PRIVATE_KEY') +
        shopProcessId.toString() + amountStr + currency,
      )
      .digest('hex');

    const body = {
      public_key: this.cfg.get('BANCARD_PUBLIC_KEY'),
      operation: {
        token,
        shop_process_id: shopProcessId,
        amount:          amountStr,
        currency,
        iva_amount:      '0.00',
        description:     'Sesiones de Coaching',
        additional_data: '',
        return_url:  `${this.cfg.get('FRONTEND_URL')}/pago/confirmacion`,
        cancel_url:  `${this.cfg.get('FRONTEND_URL')}/pago/cancelado`,
      },
    };

    const res = await fetch(
      `${this.cfg.get('BANCARD_BASE_URL')}/vpos/api/0.3/single_buy`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body) },
    );
    const data = await res.json();
    if (data.status !== 'success')
      throw new BadRequestException(data.messages?.[0]?.dsc ?? 'Error Bancard');

    await this.prisma.payment.create({
      data: {
        patientId,
        amount,
        currency,
        bancardProcessId: shopProcessId.toString(),
      },
    });

    return { processId: shopProcessId.toString() };
  }

  // Compra directa del libro "Despertá y avanzá, ¡Carajo!" — no requiere paciente/patientId,
  // por eso no persiste en Payment (que está atado a User). El shop_process_id lleva el
  // prefijo numérico "9" para no pisar el rango de los pagos de coaching.
  async createBookPaymentLink(buyerEmail: string, amount: number, currency: string) {
    const shopProcessId = Number(`9${Date.now()}`.slice(0, 15));
    const amountStr     = amount.toFixed(2);

    const token = crypto.createHash('md5')
      .update(
        this.cfg.get('BANCARD_PRIVATE_KEY') +
        shopProcessId.toString() + amountStr + currency,
      )
      .digest('hex');

    const body = {
      public_key: this.cfg.get('BANCARD_PUBLIC_KEY'),
      operation: {
        token,
        shop_process_id: shopProcessId,
        amount:          amountStr,
        currency,
        iva_amount:      '0.00',
        description:     `Libro: Despertá y avanzá, ¡Carajo!`,
        // TODO(Diego): confirmar si Bancard efectivamente devuelve additional_data en el
        // webhook de confirmación en producción — de eso depende que el email de compra
        // del libro se envíe automáticamente (ver handleWebhook, rama "LIBRO:").
        additional_data: `LIBRO:${buyerEmail}`,
        return_url:  `${this.cfg.get('FRONTEND_URL')}/libro/pago/confirmacion`,
        cancel_url:  `${this.cfg.get('FRONTEND_URL')}/libro/pago/cancelado`,
      },
    };

    const res = await fetch(
      `${this.cfg.get('BANCARD_BASE_URL')}/vpos/api/0.3/single_buy`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body) },
    );
    const data = await res.json();
    if (data.status !== 'success')
      throw new BadRequestException(data.messages?.[0]?.dsc ?? 'Error Bancard');

    this.logger.log(
      `Compra de libro iniciada — shop_process_id: ${shopProcessId} | email: ${buyerEmail}`,
    );

    return { processId: shopProcessId.toString() };
  }

  async handleWebhook(payload: any) {
    const op = payload?.operation;

    if (!op?.shop_process_id) {
      this.logger.warn('Webhook recibido sin shop_process_id');
      return { status: 'success' };
    }

    // 1. VERIFICAR FIRMA MD5
    // md5(private_key + shop_process_id + "confirm" + amount + currency)
    const privateKey = this.cfg.get<string>('BANCARD_PRIVATE_KEY');
    if (privateKey) {
      const amountStr = parseFloat(op.amount ?? '0').toFixed(2);
      const expectedToken = crypto
        .createHash('md5')
        .update(
          privateKey +
          op.shop_process_id +
          'confirm' +
          amountStr +
          (op.currency ?? 'PYG'),
        )
        .digest('hex');

      if (op.token !== expectedToken) {
        this.logger.error(
          `Webhook con firma inválida — shop_process_id: ${op.shop_process_id}`,
        );
        return { status: 'success' };
      }
    }

    // 2. VERIFICAR QUE EL PAGO EXISTE Y ESTÁ PENDIENTE
    const payment = await this.prisma.payment.findUnique({
      where: { bancardProcessId: op.shop_process_id },
      include: { patient: true },
    });

    if (!payment) {
      // No es un pago de coaching conocido — puede ser una compra del libro,
      // identificada por el prefijo "LIBRO:" que le agregamos a additional_data
      // al iniciar el pago en createBookPaymentLink().
      const bookEmail = this.extractBookBuyerEmail(op.additional_data);
      if (bookEmail) {
        return this.handleBookWebhook(op, bookEmail);
      }

      this.logger.warn(
        `Webhook para pago inexistente: ${op.shop_process_id}`,
      );
      return { status: 'success' };
    }

    if (payment.status === 'CONFIRMED') {
      this.logger.warn(
        `Webhook duplicado para pago ya confirmado: ${op.shop_process_id}`,
      );
      return { status: 'success' };
    }

    // 3. PAGO RECHAZADO
    if (op.response !== 'S') {
      this.logger.log(
        `Pago rechazado — shop_process_id: ${op.shop_process_id} | código: ${op.response_code}`,
      );
      await this.prisma.payment.update({
        where: { bancardProcessId: op.shop_process_id },
        data:  { status: 'FAILED' },
      });
      return { status: 'success' };
    }

    // 4. PAGO APROBADO — ACTIVAR PACIENTE
    await this.prisma.payment.update({
      where: { bancardProcessId: op.shop_process_id },
      data:  { status: 'CONFIRMED', authNumber: op.authorization_number },
    });

    await this.prisma.user.update({
      where: { id: payment.patientId },
      data:  { status: 'ACTIVE' },
    });

    this.logger.log(
      `Pago confirmado — patientId: ${payment.patientId} | auth: ${op.authorization_number}`,
    );

    await this.email.sendWelcomeAfterPayment({
      to:          payment.patient.email,
      name:        payment.patient.name,
      calendarUrl: `${this.cfg.get('FRONTEND_URL')}/registrados`,
    });

    return { status: 'success' };
  }

  private extractBookBuyerEmail(additionalData: unknown): string | null {
    if (typeof additionalData !== 'string' || !additionalData.startsWith('LIBRO:')) {
      return null;
    }
    return additionalData.slice('LIBRO:'.length) || null;
  }

  private async handleBookWebhook(op: any, buyerEmail: string) {
    if (op.response !== 'S') {
      this.logger.log(
        `Compra de libro rechazada — shop_process_id: ${op.shop_process_id} | código: ${op.response_code}`,
      );
      return { status: 'success' };
    }

    this.logger.log(
      `Compra de libro confirmada — shop_process_id: ${op.shop_process_id} | email: ${buyerEmail}`,
    );

    await this.email.sendBookPurchaseConfirmation({ to: buyerEmail });

    return { status: 'success' };
  }
}
