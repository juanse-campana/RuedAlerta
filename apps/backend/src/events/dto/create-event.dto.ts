import { IsDateString, IsEnum, IsLatitude, IsLongitude, IsOptional, IsUUID } from 'class-validator';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @IsUUID()
  externalEventId!: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
