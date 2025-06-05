import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBinDto {
  @ApiProperty({
    description: 'Latitude coordinate of the bin location',
    example: 52.2297,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90 degrees' })
  @Max(90, { message: 'Latitude must be between -90 and 90 degrees' })
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the bin location',
    example: 21.0122,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180 degrees' })
  @Max(180, { message: 'Longitude must be between -180 and 180 degrees' })
  @Type(() => Number)
  longitude: number;

  @ApiProperty({
    description: 'Type of the bin',
    example: 'bin',
    required: false,
    default: 'bin',
  })
  @IsOptional()
  @IsString({ message: 'Bin type must be a string' })
  type?: string = 'bin';
}
