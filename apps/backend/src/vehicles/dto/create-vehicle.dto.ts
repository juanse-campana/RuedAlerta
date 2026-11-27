import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @IsEnum(VehicleType)
  type!: VehicleType;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  alias!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  plate?: string;
}
