import {
  Controller, Post, Body,
  UnauthorizedException, BadRequestException,
} from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { ConfigService }   from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// TODO(Diego): confirmar precio final de venta del libro (ver apps/web/src/lib/book.ts).
const BOOK_PRICE = { amount: 150000, currency: 'PYG' }

@Controller('payments')
export class PaymentsController {
  constructor(
    private payments: PaymentsService,
    private cfg:      ConfigService,
  ) {}

  @Post('create-link')
  async createLink(@Body() body: { token: string }) {
    if (!body.token) throw new UnauthorizedException('Token requerido')
    let payload: any
    try {
      payload = jwt.verify(body.token, this.cfg.get('JWT_SECRET')!)
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }
    const amount   = payload.amount   ?? 1300
    const currency = payload.currency ?? 'USD'
    return this.payments.createPaymentLink(payload.patientId, amount, currency)
  }

  @Post('libro/initiate')
  async initiateBookPurchase(@Body() body: { email: string }) {
    if (!body.email || !EMAIL_RE.test(body.email)) {
      throw new BadRequestException('Email inválido')
    }
    return this.payments.createBookPaymentLink(
      body.email, BOOK_PRICE.amount, BOOK_PRICE.currency,
    )
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.payments.handleWebhook(body)
  }

  @Post('confirm')
  confirm(@Body() body: any) {
    return this.payments.handleWebhook(body)
  }
}
