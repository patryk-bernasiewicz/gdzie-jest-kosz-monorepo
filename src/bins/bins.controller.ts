import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BinsService } from './bins.service';
import { Bin } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Controller('bins')
export class BinsController {
  private logger = new Logger(BinsController.name);

  constructor(
    private readonly binsService: BinsService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getNearbyBins(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
  ): Promise<Bin[]> {
    if (!latitude || !longitude) {
      return Promise.resolve([]);
    }

    return this.binsService.getNearbyBins(Number(latitude), Number(longitude));
  }

  @Post()
  async createBin(
    @Query('clerkId') clerkId: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<Bin> {
    const user = await this.userService.getByClerkId(clerkId);
    if (!user) {
      this.logger.error(`User with clerkId ${clerkId} not found`);
      throw new Error('User not found');
    }

    const isAdmin = user.role === 'admin';

    return this.binsService.createBin(latitude, longitude, user.id, isAdmin);
  }
}
