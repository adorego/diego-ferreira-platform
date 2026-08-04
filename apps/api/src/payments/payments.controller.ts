import {
  Controller, Post, Get, Body, Query, UseGuards,
  UnauthorizedException, BadRequestException,
} from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { ConfigService }   from '@nestjs/config'
import { JwtGuard }        from '../auth/jwt.guard'
import * as jwt from 'jsonwebtoken'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    return this.payments.createPaymentLink(payload.patientId, amount, currency, payload.sessionId)
  }

  @Post('libro/initiate')
  async initiateBookPurchase(@Body() body: { email: string; nombre?: string }) {
    if (!body.email || !EMAIL_RE.test(body.email)) {
      throw new BadRequestException('Email inválido')
    }
    // nombre es opcional: la sección embebida de /main (BookPurchase.tsx) solo manda
    // email y no debe romperse; el formulario nuevo de /avanza siempre manda ambos.
    return this.payments.createBookPaymentLink(body.email, body.nombre?.trim() || '')
  }

  @Get('libro/download')
  async downloadBook(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token requerido')
    return this.payments.downloadBook(token)
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.payments.handleWebhook(body)
  }

  @Post('confirm')
  confirm(@Body() body: any) {
    return this.payments.handleWebhook(body)
  }

  @UseGuards(JwtGuard)
  @Post('rollback')
  rollback(@Body() body: { shopProcessId: string }) {
    return this.payments.rollback(body.shopProcessId)
  }

  @UseGuards(JwtGuard)
  @Post('confirmation')
  getConfirmation(@Body() body: { shopProcessId: string }) {
    return this.payments.getConfirmation(body.shopProcessId)
  }
}
