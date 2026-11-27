import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly database: DatabaseService) {}

  create(ownerId: string, dto: CreateVehicleDto) {
    return this.database.vehicle.create({ data: { ownerId, type: dto.type, alias: dto.alias.trim(), plate: dto.plate?.trim() || null } });
  }

  list(ownerId: string) {
    return this.database.vehicle.findMany({ where: { ownerId }, include: { node: true }, orderBy: { createdAt: 'desc' } });
  }

  async getOwned(ownerId: string, vehicleId: string) {
    const vehicle = await this.database.vehicle.findFirst({ where: { id: vehicleId, ownerId }, include: { node: true } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }
}
