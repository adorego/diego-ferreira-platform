import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    let database: 'connected' | 'error' = 'connected';
    let redis: 'connected' | 'error'    = 'connected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'error';
    }

    try {
      if (process.env.REDIS_URL) {
        new URL(process.env.REDIS_URL);
      }
    } catch {
      redis = 'error';
    }

    return {
      status:    'ok',
      timestamp: new Date().toISOString(),
      database,
      redis,
    };
  }
}
