import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BinsService } from './bins.service';
import { Bin, User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { CurrentUser } from 'src/user/current-user.decorator';
import { ClerkAuthGuard } from 'src/user/clerk-auth.guard';

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
  @UseGuards(ClerkAuthGuard)
  async createBin(
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @CurrentUser() user: User,
  ): Promise<Bin> {
    const isAdmin = user.role === 'admin';
    return this.binsService.createBin(latitude, longitude, user.id, isAdmin);
  }
}
