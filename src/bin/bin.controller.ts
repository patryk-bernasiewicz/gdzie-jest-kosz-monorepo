import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { BinService } from './bin.service';
import { Bin } from '@prisma/client';

@Controller('bin')
export class BinController {
  private logger = new Logger(BinController.name);

  constructor(private readonly binService: BinService) {}

  @Get()
  getNearbyBins(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<Bin[]> {
    return this.binService.getNearbyBins(Number(latitude), Number(longitude));
  }
}
