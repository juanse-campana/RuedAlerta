import { NotFoundException } from '@nestjs/common';
import { EventType } from '@prisma/client';
import { EventsService } from './events.service';

describe('EventsService', () => {
  const database = {
    deviceNode: { findFirst: jest.fn() },
    event: { upsert: jest.fn(), findMany: jest.fn() },
    vehicle: { findFirst: jest.fn() },
  };
  const service = new EventsService(database as never);

  beforeEach(() => jest.clearAllMocks());

  it('rejects an event for a node outside the authenticated owner scope', async () => {
    database.deviceNode.findFirst.mockResolvedValue(null);

    await expect(service.create('owner-a', 'node-b', {
      externalEventId: '11111111-1111-4111-8111-111111111111',
      type: EventType.IMPACT,
    })).rejects.toBeInstanceOf(NotFoundException);
    expect(database.event.upsert).not.toHaveBeenCalled();
  });

  it('uses the node and external event id as the idempotency key', async () => {
    database.deviceNode.findFirst.mockResolvedValue({ id: 'node-a', vehicleId: 'vehicle-a' });
    database.event.upsert.mockResolvedValue({ id: 'event-a' });
    const dto = {
      externalEventId: '11111111-1111-4111-8111-111111111111',
      type: EventType.FALL,
    };

    await service.create('owner-a', 'node-a', dto);

    expect(database.event.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { nodeId_externalEventId: { nodeId: 'node-a', externalEventId: dto.externalEventId } },
      update: {},
    }));
  });

  it('rejects event history for a vehicle outside the authenticated owner scope', async () => {
    database.vehicle.findFirst.mockResolvedValue(null);

    await expect(service.list('owner-a', 'vehicle-b')).rejects.toBeInstanceOf(NotFoundException);
    expect(database.event.findMany).not.toHaveBeenCalled();
  });
});
