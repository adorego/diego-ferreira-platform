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

  async admitPatient(dto: {
    email: string; name: string;
    price: string; sessions: number; currency: string;
  }) {
    const patient = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!patient) throw new NotFoundException();

    await this.prisma.user.update({
      where: { id: patient.id },
      data:  { status: 'APPROVED' },
    });

    // JWT de un solo uso (48h) para el link de pago
    const token = jwt.sign(
      { patientId: patient.id },
      this.cfg.get('JWT_SECRET')!,
      { expiresIn: '48h' },
    );
    const paymentUrl =
      `${this.cfg.get('FRONTEND_URL')}/pago?token=${token}`;

    await this.email.sendApproval({
      to: patient.email, name: patient.name,
      paymentUrl, price: dto.price, currency: dto.currency,
    });

    return { ok: true, paymentUrl };
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