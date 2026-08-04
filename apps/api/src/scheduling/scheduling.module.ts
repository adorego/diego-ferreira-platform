import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports:     [ConfigModule, PrismaModule, CalendarModule],
  controllers: [SchedulingController],
  providers:   [SchedulingService],
})
export class SchedulingModule {}
