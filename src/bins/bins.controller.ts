import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BinsService } from './bins.service';
import { Bin, User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { CurrentUser } from '../user/current-user.decorator';
import { ClerkAuthGuard } from '../user/clerk-auth.guard';
import { AdminGuard } from 'src/user/admin.guard';

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

  @Get('admin')
  @UseGuards(ClerkAuthGuard, AdminGuard)
  async getAllBinsAsAdmin(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @CurrentUser() user: User,
  ): Promise<Bin[]> {
    this.logger.log(`User ID: ${user.id}, Role: ${user.role}`);
    return this.binsService.getAllNearbyBins(
      Number(latitude) || 0,
      Number(longitude) || 0,
    );
  }

  @Post('admin')
  @UseGuards(ClerkAuthGuard, AdminGuard)
  async createBinAsAdmin(
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @CurrentUser() user: User,
  ): Promise<Bin> {
    return this.binsService.createBin(latitude, longitude, user.id, true);
  }

  @Put('admin/:binId/location')
  @UseGuards(ClerkAuthGuard, AdminGuard)
  async updateBinLocationAsAdmin(
    @Param('binId') binId: number,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ): Promise<Bin> {
    return this.binsService.updateBinLocation(binId, latitude, longitude);
  }
}
