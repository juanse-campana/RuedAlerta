import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNodeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  externalId!: string;
}
