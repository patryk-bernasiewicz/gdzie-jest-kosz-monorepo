import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AcceptBinDto {
  @ApiProperty({
    description: 'Whether the bin is accepted or not.',
    example: true,
  })
  @IsBoolean()
  accept: boolean;
}
