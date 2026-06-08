import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService }  from '../email/email.service';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    private email:  EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    const now = Date.now();

    const windows: Array<{ gte: Date; lte: Date; hoursUntil: 1 | 24 }> = [
      // 24h antes: entre 23h y 25h desde ahora
      { gte: new Date(now + 23 * 3600_000),
        lte: new Date(now + 25 * 3600_000),
        hoursUntil: 24 },
      // 1h antes: entre 50min y 70min desde ahora
      { gte: new Date(now + 50 * 60_000),
        lte: new Date(now + 70 * 60_000),
        hoursUntil: 1 },
    ];

    for (const { hoursUntil, ...timeWindow } of windows) {
      const sessions = await this.prisma.session.findMany({
        where:   { start: timeWindow, status: 'CONFIRMED', reminderSent: false },
        include: { patient: true },
      });

      for (const s of sessions) {
        await this.email.sendReminder({
          to:          s.patient.email,
          name:        s.patient.name,
          sessionDate: new Date(s.start!).toLocaleString('es-PY', {
            timeZone: 'America/Asuncion',
          }),
          roomUrl:     s.roomUrl ?? '',
          hoursUntil,
        });
        await this.prisma.session.update({
          where: { id: s.id },
          data:  { reminderSent: true },
        });
      }
    }
  }
}