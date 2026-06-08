import { Module }       from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarController } from './calendar.controller';
import { CalendarService }    from './calendar.service';
import { PrismaModule }       from '../prisma/prisma.module';

@Module({
  imports:     [ConfigModule, PrismaModule],
  controllers: [CalendarController],
  providers:   [CalendarService],
  exports:     [CalendarService],
})
export class CalendarModule {}
