import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateNodeDto } from './dto/create-node.dto';

@Injectable()
export class NodesService {
  constructor(private readonly database: DatabaseService) {}

  async create(ownerId: string, vehicleId: string, dto: CreateNodeDto) {
    const vehicle = await this.database.vehicle.findFirst({ where: { id: vehicleId, ownerId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    try {
      return await this.database.deviceNode.create({ data: { vehicleId, externalId: dto.externalId.trim() } });
    } catch (error) {
      if (error instanceof Error && error.constructor.name === 'PrismaClientKnownRequestError') throw new ConflictException('Node already exists or vehicle already has a node');
      throw error;
    }
  }

  async list(ownerId: string, vehicleId: string) {
    const vehicle = await this.database.vehicle.findFirst({ where: { id: vehicleId, ownerId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.database.deviceNode.findMany({ where: { vehicleId }, orderBy: { createdAt: 'desc' } });
  }

  async getOwned(ownerId: string, nodeId: string) {
    const node = await this.database.deviceNode.findFirst({ where: { id: nodeId, vehicle: { ownerId } }, include: { vehicle: true } });
    if (!node) throw new NotFoundException('Node not found');
    return node;
  }
}
