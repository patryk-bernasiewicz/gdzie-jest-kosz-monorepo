import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BinsService } from './bins.service';
import { Bin, User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { CurrentUser } from '../user/current-user.decorator';
import { ClerkAuthGuard } from '../user/clerk-auth.guard';
import { AdminGuard } from '../user/admin.guard';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('bins')
@Controller({ path: 'bins', version: '1' })
export class BinsController {
  private logger = new Logger(BinsController.name);

  constructor(
    private readonly binsService: BinsService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Get nearby bins using latitude and longitude' })
  @ApiResponse({ status: 200, description: 'Nearby bins found' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
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

  @ApiOperation({ summary: 'Create a new bin as a signed in user' })
  @ApiResponse({ status: 201, description: 'Bin created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
      required: ['latitude', 'longitude'],
    },
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @Post()
  @UseGuards(ClerkAuthGuard)
  async createBin(
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @CurrentUser() user: User,
  ): Promise<Bin> {
    console.log('POST createBin called');
    const isAdmin = user.role === 'admin';
    return this.binsService.createBin(latitude, longitude, user.id, isAdmin);
  }

  @ApiOperation({ summary: 'Get all bins for the location as admin' })
  @ApiResponse({ status: 200, description: 'All bins found' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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

  @ApiOperation({ summary: 'Create a bin as admin' })
  @ApiResponse({ status: 201, description: 'Bin created successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
      required: ['latitude', 'longitude'],
    },
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @Post('admin')
  @UseGuards(ClerkAuthGuard, AdminGuard)
  async createBinAsAdmin(
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @CurrentUser() user: User,
  ): Promise<Bin> {
    return this.binsService.createBin(latitude, longitude, user.id, true);
  }

  @ApiOperation({ summary: 'Update bin location as admin' })
  @ApiResponse({
    status: 200,
    description: 'Bin location updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Bin not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
      required: ['latitude', 'longitude'],
    },
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
