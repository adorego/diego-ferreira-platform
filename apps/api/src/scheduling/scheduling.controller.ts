import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';

@Controller('scheduling')
export class SchedulingController {
  constructor(private scheduling: SchedulingService) {}

  @Get('validate')
  validate(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token requerido');
    return this.scheduling.validate(token);
  }

  @Post('book')
  book(@Body() body: { token: string; start: string }) {
    if (!body.token) throw new BadRequestException('Token requerido');
    if (!body.start) throw new BadRequestException('Fecha/hora requerida');
    return this.scheduling.book(body.token, body.start);
  }
}
