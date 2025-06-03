import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BinsService } from './bins.service';
import { Bin, User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AcceptBinDto } from './dto/accept-bin.dto';
import { CreateBinDto } from './dto/create-bin.dto';
import { GetNearbyBinsDto } from './dto/get-nearby-bins.dto';
import { BinNotFoundException } from '../common/exceptions/bin.exceptions';

const ErrorResponseSchema = {
  example: {
    statusCode: 404,
    timestamp: '2024-01-15T10:30:00.000Z',
    path: '/api/v1/bins/123',
    message: 'Bin with ID 123 not found',
    error: 'Not Found',
  },
};

@ApiTags('bins')
@Controller({ path: 'bins', version: '1' })
export class BinsController {
  private readonly logger = new Logger(BinsController.name);

  constructor(
    private readonly binsService: BinsService,
  ) { }

  @ApiOperation({ summary: 'Get nearby bins using latitude and longitude' })
  @ApiResponse({ status: 200, description: 'Nearby bins found' })
  @ApiResponse({ status: 400, description: 'Validation error', schema: ErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: ErrorResponseSchema })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @Get()
  getNearbyBins(
    @Query() query: GetNearbyBinsDto,
  ): Promise<Bin[]> {
    this.logger.log(`GET /bins called with lat=${query.latitude}, lng=${query.longitude}`);
    return this.binsService.getNearbyBins(query.latitude, query.longitude);
  }

  @ApiOperation({ summary: 'Create a new bin as a signed in user' })
  @ApiResponse({ status: 201, description: 'Bin created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error', schema: ErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: ErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', schema: ErrorResponseSchema })
  @ApiResponse({ status: 409, description: 'Conflict (duplicate bin)', schema: ErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: ErrorResponseSchema })
  @ApiBody({ type: CreateBinDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @Post()
  @UseGuards(AuthGuard)
  async createBin(
    @Body() createBinDto: CreateBinDto,
    @CurrentUser() user: User,
  ): Promise<Bin> {
    this.logger.debug(`User ${user.id} creating bin at (${createBinDto.latitude}, ${createBinDto.longitude})`);
    const isAdmin = user.role === 'admin';
    return this.binsService.createBin(
      createBinDto.latitude,
      createBinDto.longitude,
      user.id,
      isAdmin
    );
  }

  @ApiOperation({ summary: 'Get all bins for the location as admin' })
  @ApiResponse({ status: 200, description: 'All bins found' })
  @ApiResponse({ status: 400, description: 'Validation error', schema: ErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: ErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', schema: ErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: ErrorResponseSchema })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @Get('admin')
  @UseGuards(AuthGuard, AdminGuard)
  async getAllBinsAsAdmin(
    @Query() query: GetNearbyBinsDto,
    @CurrentUser() user: User,
  ): Promise<Bin[]> {
    this.logger.log(`Admin ${user.id} requesting all bins for coordinates (${query.latitude}, ${query.longitude})`);
    return this.binsService.getAllNearbyBins(query.latitude, query.longitude);
  }

  @ApiOperation({ summary: 'Create a bin as admin' })
  @ApiResponse({ status: 201, description: 'Bin created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error', schema: ErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: ErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', schema: ErrorResponseSchema })
  @ApiResponse({ status: 409, description: 'Conflict (duplicate bin)', schema: ErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: ErrorResponseSchema })
  @ApiBody({ type: CreateBinDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @Post('admin')
  @UseGuards(AuthGuard, AdminGuard)
  async createBinAsAdmin(
    @Body() createBinDto: CreateBinDto,
    @CurrentUser() user: User,
  ): Promise<Bin> {
    this.logger.log(`Admin ${user.id} creating bin at (${createBinDto.latitude}, ${createBinDto.longitude})`);
    return this.binsService.createBin(
      createBinDto.latitude,
      createBinDto.longitude,
      user.id,
      true
    );
  }

  @ApiOperation({ summary: 'Update bin location as admin' })
  @ApiResponse({ status: 200, description: 'Bin location updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error', schema: ErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: ErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', schema: ErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'Bin not found', schema: ErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: ErrorResponseSchema })
  @ApiBody({ type: CreateBinDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @Put('admin/:binId/location')
  @UseGuards(AuthGuard, AdminGuard)
  async updateBinLocationAsAdmin(
    @Param('binId', ParseIntPipe) binId: number,
    @Body() updateLocationDto: CreateBinDto,
  ): Promise<Bin> {
    const bin = await this.binsService.getBinById(binId);
    if (!bin) {
      throw new BinNotFoundException(binId);
    }

    this.logger.log(`Admin updating bin ${binId} location to (${updateLocationDto.latitude}, ${updateLocationDto.longitude})`);
    return this.binsService.updateBinLocation(
      binId,
      updateLocationDto.latitude,
      updateLocationDto.longitude
    );
  }

  @ApiOperation({ summary: 'Update bin state (acceptedAt field)' })
  @ApiResponse({ status: 200, description: 'Bin state updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error', schema: ErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: ErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', schema: ErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'Bin not found', schema: ErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: ErrorResponseSchema })
  @ApiBody({ type: AcceptBinDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @Put('admin/:binId/accept')
  @UseGuards(AuthGuard, AdminGuard)
  async acceptBin(
    @Param('binId', ParseIntPipe) binId: number,
    @Body() acceptBinDto: AcceptBinDto,
  ): Promise<Bin> {
    const bin = await this.binsService.getBinById(binId);
    if (!bin) {
      throw new BinNotFoundException(binId);
    }

    this.logger.log(`${acceptBinDto.accept ? 'Accepting' : 'Rejecting'} bin ${binId}`);
    return this.binsService.acceptBin(binId, acceptBinDto.accept);
  }
}
