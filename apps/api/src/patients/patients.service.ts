import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { PrismaService }  from '../prisma/prisma.service';
import { EmailService }   from '../email/email.service';
import { ConfigService }  from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PatientsService {
  constructor(
    private prisma:  PrismaService,
    private email:   EmailService,
    private cfg:     ConfigService,
  ) {}

  async findByEmail(email: string) {
    const p = await this.prisma.user.findUnique({
      where:   { email },
      include: { sessions: { orderBy: { start: 'asc' } }, payments: true },
    });
    if (!p) throw new NotFoundException('Paciente no encontrado');
    return p;
  }

  async exists(email: string) {
    const n = await this.prisma.user.count({ where: { email } });
    return { exists: n > 0 };
  }

  async getAllSessions() {
    return this.prisma.session.findMany({
      include: { patient: true, summary: true },
      orderBy: { start: 'desc' },
    });
  }

  async create(data: {
    name: string; email: string;
    country: string; passwordHash: string;
  }) {
    return this.prisma.user.create({ data });
  }

  private static readonly PLAN_LABEL: Record<string, string> = {
    EXPLORATORY: 'Sesión exploratoria',
    PLAN:        'Programa de coaching',
  };

  // Antes buscaba al paciente por email y solo actualizaba User.status — la Session
  // puntual que se estaba aprobando nunca cambiaba de PENDING, así que volvía a
  // aparecer como pendiente después de refrescar el dashboard. Ahora opera sobre un
  // sessionId concreto (el dashboard ya lo tiene disponible) y actualiza ambos.
  async admitPatient(dto: {
    sessionId: number;
    price: string; sessions: number; currency: string;
  }) {
    const session = await this.prisma.session.findUnique({
      where:   { id: dto.sessionId },
      include: { patient: true },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    await this.prisma.user.update({
      where: { id: session.patient.id },
      data:  { status: 'APPROVED' },
    });
    await this.prisma.session.update({
      where: { id: session.id },
      // totalSessions se persiste acá porque es el único momento en que dto.sessions
      // (cuántas sesiones compró) existe — el webhook de pago, días después, necesita
      // leerlo para armar el JWT de agendamiento y no tiene otra fuente para eso.
      data:  { status: 'CONFIRMED', totalSessions: dto.sessions },
    });

    // JWT de un solo uso (48h) para el link de pago. Antes solo llevaba patientId —
    // POST /payments/create-link lee amount/currency del propio payload del JWT
    // (payload.amount ?? 1300, payload.currency ?? 'USD'), así que sin esto el
    // paciente terminaba pagando el fallback hardcodeado en vez del monto real que
    // Diego cargó en el AdmitDialog, sin ninguna relación con lo que decía el email.
    // sessionId es nuevo acá también — sin él, createPaymentLink() no tiene forma de
    // vincular el Payment resultante a esta Session (Session.paymentId existía en el
    // schema pero ningún código lo llenaba), y el webhook de pago no podría saber a
    // qué sesión corresponde el pago para marcarla PAID ni armar el link de agendamiento.
    const token = jwt.sign(
      {
        patientId: session.patient.id, sessionId: session.id,
        amount: Number(dto.price), currency: dto.currency,
      },
      this.cfg.get('JWT_SECRET')!,
      { expiresIn: '48h' },
    );
    const paymentUrl =
      `${this.cfg.get('FRONTEND_URL')}/pago?token=${token}`;

    await this.email.sendApproval({
      to: session.patient.email, name: session.patient.name,
      paymentUrl, price: dto.price, currency: dto.currency,
      sessions:    dto.sessions,
      planLabel:   PatientsService.PLAN_LABEL[session.type] ?? session.type,
      sessionDate: session.start
        ? session.start.toLocaleString('es-PY', { dateStyle: 'long', timeStyle: 'short' })
        : undefined,
    });

    return { ok: true, paymentUrl };
  }

  // NOTA: AppStatus (schema.prisma) solo tiene PENDING|CONFIRMED|COMPLETED|CANCELLED —
  // no existe un valor REJECTED dedicado. Agregarlo requeriría una migración de Prisma
  // contra la base de staging, que no se hizo acá. Se reusa CANCELLED como el más
  // cercano semánticamente a "rechazado por Diego"; si se necesita distinguir de una
  // cancelación real (iniciada por el paciente), hay que decidir el enum nuevo y migrar.
  async rejectSession(sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where:   { id: sessionId },
      include: { patient: true },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    await this.prisma.session.update({
      where: { id: sessionId },
      data:  { status: 'CANCELLED' },
    });

    await this.email.sendRejection({
      to:   session.patient.email,
      name: session.patient.name,
    });

    return { ok: true };
  }

  async updateSessionDate(
    sessionId: number,
    data: { start: string; end: string },
  ) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data:  { start: new Date(data.start), end: new Date(data.end) },
    });
  }
}