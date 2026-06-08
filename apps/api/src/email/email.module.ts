import { Module }        from '@nestjs/common'
import { ConfigModule }  from '@nestjs/config'
import { EmailService }  from './email.service'

@Module({
  imports:   [ConfigModule],
  providers: [EmailService],
  exports:   [EmailService],   // ← necesario para que otros módulos lo inyecten
})
export class EmailModule {}