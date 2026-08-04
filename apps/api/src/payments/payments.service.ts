import {
  Injectable,
  BadRequestException,
  NotFoundException,
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

  // Compra directa del libro "Despertá y avanzá, ¡Carajo!" — no requiere
  // paciente/patientId, por eso tiene su propia tabla BookPurchase en vez de Payment.
  // BOOK_AMOUNT/BOOK_CURRENCY son configurables porque Bancard staging solo tiene PYG
  // habilitado (USD hardcodeado generaba un process_id inválido en el VPOS) — cambiar
  // a USD cuando esté habilitado en Bancard producción.
  //
  // Bancard exige el monto siempre con dos decimales ("95000.00", no "95000") — el token
  // MD5 se firma con este mismo string, así que un monto sin normalizar desincroniza la
  // firma que calculamos acá de la que Bancard recalcula del otro lado y responde
  // "Invalid token" aunque la private key sea correcta. BOOK_AMOUNT en Railway está seteado
  // como "95000" (sin decimales), por eso se normaliza acá en vez de asumir el formato.
  async createBookPaymentLink(email: string, nombre: string) {
    const amountStr = Number(this.cfg.get('BOOK_AMOUNT') ?? '95000').toFixed(2);
    const currency  = this.cfg.get('BOOK_CURRENCY') ?? 'PYG';

    // Bancard exige que shop_process_id sea numérico (verificado contra la API real de
    // VPOS 2.0 en este proyecto) — por eso, aunque generamos un UUID como identificador
    // interno único de la compra, el valor que efectivamente viaja a Bancard y se guarda
    // en BookPurchase.shopProcessId es un número derivado de timestamp + random.
    const purchaseUuid  = crypto.randomUUID();
    const shopProcessId = Number(
      `7${Date.now()}${Math.floor(100 + Math.random() * 900)}`.slice(0, 15),
    );

    const token = crypto.createHash('md5')
      .update(
        this.cfg.get('BANCARD_PRIVATE_KEY') +
        shopProcessId.toString() + amountStr + currency,
      )
      .digest('hex');

    const returnUrl = this.cfg.get('BANCARD_RETURN_URL_LIBRO')
      || `${this.cfg.get('FRONTEND_URL')}/avanza/confirmacion`;
    const cancelUrl = this.cfg.get('BANCARD_CANCEL_URL_LIBRO')
      || `${this.cfg.get('FRONTEND_URL')}/avanza/cancelado`;

    const body = {
      public_key: this.cfg.get('BANCARD_PUBLIC_KEY'),
      operation: {
        token,
        shop_process_id: shopProcessId,
        amount:          amountStr,
        currency,
        iva_amount:      '0.00',
        description:     'Libro: Despertá y avanzá, ¡Carajo!',
        additional_data: '',
        return_url:      returnUrl,
        cancel_url:      cancelUrl,
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

    await this.prisma.bookPurchase.create({
      data: {
        shopProcessId: shopProcessId.toString(),
        email,
        nombre,
        amount:   amountStr,
        currency,
      },
    });

    this.logger.log(
      `Compra de libro iniciada — uuid: ${purchaseUuid} | shop_process_id: ${shopProcessId} | email: ${email}`,
    );

    return { processId: shopProcessId.toString(), shopProcessId: shopProcessId.toString() };
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
      // que usa su propia tabla (BookPurchase) en vez de Payment.
      const bookPurchase = await this.prisma.bookPurchase.findUnique({
        where: { shopProcessId: op.shop_process_id },
      });
      if (bookPurchase) {
        return this.handleBookPurchaseWebhook(op, bookPurchase);
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

  private async handleBookPurchaseWebhook(
    op: any,
    purchase: { shopProcessId: string; status: string },
  ) {
    if (purchase.status === 'CONFIRMED') {
      this.logger.warn(
        `Webhook duplicado para compra de libro ya confirmada: ${op.shop_process_id}`,
      );
      return { status: 'success' };
    }

    if (op.response !== 'S') {
      this.logger.log(
        `Compra de libro rechazada — shop_process_id: ${op.shop_process_id} | código: ${op.response_code}`,
      );
      await this.prisma.bookPurchase.update({
        where: { shopProcessId: op.shop_process_id },
        data:  { status: 'FAILED' },
      });
      return { status: 'success' };
    }

    const downloadToken = crypto.randomUUID();
    await this.prisma.bookPurchase.update({
      where: { shopProcessId: op.shop_process_id },
      data:  { status: 'CONFIRMED', downloadToken },
    });

    this.logger.log(
      `Compra de libro confirmada — shop_process_id: ${op.shop_process_id}`,
    );

    // TODO(Diego): enviar email al comprador con el link de descarga
    // (/payments/libro/download?token=...) una vez definido el template. Por ahora
    // no se envía ninguna notificación automática.

    return { status: 'success' };
  }

  // Firma indicada por el equipo para rollback/get_confirmation — no verificada de forma
  // independiente contra el manual VPOS 2.0 (a diferencia del resto de las firmas de este
  // archivo, que sí están confirmadas contra la API real). Si Bancard rechaza el rollback,
  // revisar si el endpoint espera el monto/moneda reales de la operación en vez del literal
  // "0.00".
  async rollback(shopProcessId: string) {
    const token = crypto
      .createHash('md5')
      .update(`${this.cfg.get('BANCARD_PRIVATE_KEY')}${shopProcessId}rollback0.00`)
      .digest('hex');

    const res = await fetch(
      `${this.cfg.get('BANCARD_BASE_URL')}/vpos/api/0.3/single_buy/rollback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_key: this.cfg.get('BANCARD_PUBLIC_KEY'),
          operation: { token, shop_process_id: shopProcessId },
        }),
      },
    );
    return res.json();
  }

  async getConfirmation(shopProcessId: string) {
    const token = crypto
      .createHash('md5')
      .update(`${this.cfg.get('BANCARD_PRIVATE_KEY')}${shopProcessId}get_confirmation`)
      .digest('hex');

    const res = await fetch(
      `${this.cfg.get('BANCARD_BASE_URL')}/vpos/api/0.3/single_buy/confirmations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_key: this.cfg.get('BANCARD_PUBLIC_KEY'),
          operation: { token, shop_process_id: shopProcessId },
        }),
      },
    );
    return res.json();
  }

  async downloadBook(token: string) {
    const purchase = await this.prisma.bookPurchase.findUnique({
      where: { downloadToken: token },
    });

    if (!purchase || purchase.status !== 'CONFIRMED') {
      throw new NotFoundException('Link de descarga inválido o expirado');
    }

    await this.prisma.bookPurchase.update({
      where: { downloadToken: token },
      data:  { downloadedAt: new Date() },
    });

    return { downloadUrl: '/libro-completo.pdf' };
  }
}
