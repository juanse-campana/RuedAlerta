import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/auth.types';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post('nodes/:nodeId/events')
  create(@Req() req: AuthenticatedRequest, @Param('nodeId') nodeId: string, @Body() dto: CreateEventDto) { return this.events.create(req.user.id, nodeId, dto); }

  @Get('vehicles/:vehicleId/events')
  list(@Req() req: AuthenticatedRequest, @Param('vehicleId') vehicleId: string) { return this.events.list(req.user.id, vehicleId); }
}
