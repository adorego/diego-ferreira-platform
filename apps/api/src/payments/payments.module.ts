import { Module }             from '@nestjs/common'
import { ConfigModule }       from '@nestjs/config'
import { PaymentsService }    from './payments.service'
import { PaymentsController } from './payments.controller'
import { PrismaModule }       from '../prisma/prisma.module'
import { EmailModule }        from '../email/email.module'

@Module({
  imports:     [PrismaModule, EmailModule, ConfigModule],
  controllers: [PaymentsController],
  providers:   [PaymentsService],
  exports:     [PaymentsService],
})
export class PaymentsModule {}
