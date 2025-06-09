import { Injectable, Logger } from '@nestjs/common';
import { Bin, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  BinNotFoundException,
  InvalidLocationException,
} from '../common/exceptions/bin.exceptions';
import {
  NEARBY_BINS_DELTA_USER,
  NEARBY_BINS_DELTA_ADMIN,
} from './bins.constants';

@Injectable()
export class BinsService {
  private readonly logger = new Logger(BinsService.name);

  constructor(private db: DatabaseService) {}

  async getNearbyBins(latitude: number, longitude: number): Promise<Bin[]> {
    this.validateCoordinates(latitude, longitude);

    try {
      const bins = await this.db.bin.findMany({
        where: {
          latitude: {
            gte: latitude - NEARBY_BINS_DELTA_USER,
            lte: latitude + NEARBY_BINS_DELTA_USER,
          },
          longitude: {
            gte: longitude - NEARBY_BINS_DELTA_USER,
            lte: longitude + NEARBY_BINS_DELTA_USER,
          },
          visibility: true,
          NOT: {
            acceptedAt: null,
          },
        },
      });

      this.logger.debug(
        `Found ${bins.length} nearby bins for coordinates (${latitude}, ${longitude})`,
      );
      return bins;
    } catch (error) {
      this.logger.error(
        `Failed to get nearby bins for coordinates (${latitude}, ${longitude})`,
        error,
      );
      throw error; // Let global filter handle Prisma errors
    }
  }

  async getAllNearbyBins(latitude: number, longitude: number): Promise<Bin[]> {
    this.validateCoordinates(latitude, longitude);

    try {
      const bins = await this.db.bin.findMany({
        where: {
          latitude: {
            gte: latitude - NEARBY_BINS_DELTA_ADMIN,
            lte: latitude + NEARBY_BINS_DELTA_ADMIN,
          },
          longitude: {
            gte: longitude - NEARBY_BINS_DELTA_ADMIN,
            lte: longitude + NEARBY_BINS_DELTA_ADMIN,
          },
        },
      });

      this.logger.debug(
        `Found ${bins.length} nearby bins (including unaccepted) for coordinates (${latitude}, ${longitude})`,
      );
      return bins;
    } catch (error) {
      this.logger.error(
        `Failed to get all nearby bins for coordinates (${latitude}, ${longitude})`,
        error,
      );
      throw error;
    }
  }

  async createBin(
    latitude: number,
    longitude: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<Bin> {
    this.validateCoordinates(latitude, longitude);

    try {
      const bin = await this.db.bin.create({
        data: {
          latitude,
          longitude,
          type: 'bin',
          acceptedAt: isAdmin ? new Date() : null,
          createdById: userId,
        },
      });

      this.logger.log(
        `Created bin ${bin.id} at coordinates (${latitude}, ${longitude}) by user ${userId}`,
      );
      return bin;
    } catch (error) {
      this.logger.error(
        `Failed to create bin at coordinates (${latitude}, ${longitude})`,
        error,
      );
      throw error;
    }
  }

  async getBinById(binId: number): Promise<Bin | null> {
    try {
      const bin = await this.db.bin.findUnique({
        where: { id: Number(binId) },
      });

      if (!bin) {
        this.logger.debug(`Bin with ID ${binId} not found`);
        return null;
      }

      return bin;
    } catch (error) {
      this.logger.error(`Failed to get bin by ID: ${binId}`, error);
      throw error;
    }
  }

  async updateBinLocation(
    binId: number,
    latitude: number,
    longitude: number,
  ): Promise<Bin> {
    this.validateCoordinates(latitude, longitude);

    try {
      const bin = await this.db.bin.update({
        where: { id: Number(binId) },
        data: { latitude, longitude },
      });

      this.logger.log(
        `Updated bin ${binId} location to coordinates (${latitude}, ${longitude})`,
      );
      return bin;
    } catch (error) {
      this.logger.error(`Failed to update bin ${binId} location`, error);
      throw error;
    }
  }

  async acceptBin(binId: number, accept: boolean): Promise<Bin> {
    try {
      const bin = await this.db.bin.update({
        where: { id: Number(binId) },
        data: { acceptedAt: accept ? new Date() : null },
      });

      this.logger.log(`${accept ? 'Accepted' : 'Rejected'} bin ${binId}`);
      return bin;
    } catch (error) {
      this.logger.error(
        `Failed to ${accept ? 'accept' : 'reject'} bin ${binId}`,
        error,
      );
      throw error;
    }
  }

  async toggleBinVisibility(binId: number, visibility: boolean): Promise<Bin> {
    try {
      const bin = await this.db.bin.update({
        where: { id: Number(binId) },
        data: { visibility },
      });
      this.logger.log(`Set visibility of bin ${binId} to ${visibility}`);
      return bin;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`Bin with ID ${binId} not found for visibility toggle`);
        throw new BinNotFoundException(binId);
      }
      this.logger.error(`Failed to toggle visibility for bin ${binId}`, error);
      throw error;
    }
  }

  private validateCoordinates(latitude: number, longitude: number): void {
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new InvalidLocationException(latitude, longitude);
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new InvalidLocationException(latitude, longitude);
    }
  }
}
