import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/auth.types';
import { CreateNodeDto } from './dto/create-node.dto';
import { NodesService } from './nodes.service';

@UseGuards(JwtAuthGuard)
@Controller('vehicles/:vehicleId/nodes')
export class NodesController {
  constructor(private readonly nodes: NodesService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Param('vehicleId') vehicleId: string, @Body() dto: CreateNodeDto) { return this.nodes.create(req.user.id, vehicleId, dto); }

  @Get()
  list(@Req() req: AuthenticatedRequest, @Param('vehicleId') vehicleId: string) { return this.nodes.list(req.user.id, vehicleId); }
}
