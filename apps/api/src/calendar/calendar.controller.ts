import { Controller, Get, Post, Body } from '@nestjs/common';
import { CalendarService } from './calendar.service';

class CreateEventDto {
  summary:     string;
  description: string;
  start:       string;
  end:         string;
  attendees:   { email: string; name: string; country: string }[];
  type:        string;
}

@Controller('calendar')
export class CalendarController {
  constructor(private cal: CalendarService) {}

  // El FE consume: GET /calendar/sesiones-exterior
  @Get('sesiones-exterior')
  getAvailability() {
    return this.cal.getAvailability();
  }

  // El FE consume: POST /calendar/create-event
  @Post('create-event')
  createEvent(@Body() dto: CreateEventDto) {
    return this.cal.createEvent(dto);
  }
}