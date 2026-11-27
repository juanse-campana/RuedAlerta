import { Injectable, NotFoundException } from '@nestjs/common';
import { EventSource } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly database: DatabaseService) {}

  async create(ownerId: string, nodeId: string, dto: CreateEventDto) {
    const node = await this.database.deviceNode.findFirst({ where: { id: nodeId, vehicle: { ownerId } } });
    if (!node) throw new NotFoundException('Node not found');

    return this.database.event.upsert({
      where: { nodeId_externalEventId: { nodeId, externalEventId: dto.externalEventId } },
      create: {
        nodeId,
        vehicleId: node.vehicleId,
        externalEventId: dto.externalEventId,
        type: dto.type,
        source: EventSource.HTTP_SIMULATOR,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : null,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      update: {},
    });
  }

  async list(ownerId: string, vehicleId: string) {
    const vehicle = await this.database.vehicle.findFirst({ where: { id: vehicleId, ownerId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.database.event.findMany({ where: { vehicleId }, orderBy: { receivedAt: 'desc' } });
  }
}
