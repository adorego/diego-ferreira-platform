import {
  Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtGuard }        from '../auth/jwt.guard';

@Controller('patients')
export class PatientsController {
  constructor(private svc: PatientsService) {}

  // GET /patients/sessions  — dashboard de Diego
  @Get('sessions')
  @UseGuards(JwtGuard)
  getSessions() {
    return this.svc.getAllSessions();
  }

  // GET /patients/exists?email=xxx  — validación en tiempo real FE
  @Get('exists')
  exists(@Query('email') email: string) {
    return this.svc.exists(email);
  }

  // GET /patients/:email  — página /registrados
  @Get(':email')
  @UseGuards(JwtGuard)
  findOne(@Param('email') email: string) {
    return this.svc.findByEmail(email);
  }

  // POST /patients/admitPatient  — Diego aprueba un paciente
  @Post('admitPatient')
  @UseGuards(JwtGuard)
  admitPatient(@Body() dto: any) {
    return this.svc.admitPatient(dto);
  }

  // PATCH /sessions/:id/date  — editar fecha de sesión
  @Patch('/sessions/:id/date')
  @UseGuards(JwtGuard)
  updateDate(
    @Param('id') id: string,
    @Body() body: { start: string; end: string },
  ) {
    return this.svc.updateSessionDate(+id, body);
  }
}