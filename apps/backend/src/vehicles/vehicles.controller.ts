import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/auth.types';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateVehicleDto) { return this.vehicles.create(req.user.id, dto); }

  @Get()
  list(@Req() req: AuthenticatedRequest) { return this.vehicles.list(req.user.id); }

  @Get(':vehicleId')
  get(@Req() req: AuthenticatedRequest, @Param('vehicleId') vehicleId: string) { return this.vehicles.getOwned(req.user.id, vehicleId); }
}
