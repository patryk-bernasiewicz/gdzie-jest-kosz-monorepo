import { Injectable } from '@nestjs/common';
import { Bin, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BinsService {
  constructor(private db: DatabaseService) {}

  async getNearbyBins(latitude: number, longitude: number): Promise<Bin[]> {
    const bins = await this.db.bin.findMany({
      where: {
        latitude: {
          gte: latitude - 0.1,
          lte: latitude + 0.1,
        },
        longitude: {
          gte: longitude - 0.1,
          lte: longitude + 0.1,
        },
        NOT: {
          acceptedAt: null,
        },
      },
    });
    return bins;
  }

  async getAllNearbyBins(latitude: number, longitude: number): Promise<Bin[]> {
    const bins = await this.db.bin.findMany({
      where: {
        latitude: {
          gte: latitude - 0.01,
          lte: latitude + 0.01,
        },
        longitude: {
          gte: longitude - 0.01,
          lte: longitude + 0.01,
        },
      },
    });
    return bins;
  }

  async createBin(
    latitude: number,
    longitude: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<Bin> {
    // Call the real DB method as expected by the test
    const bin = await this.db.bin.create({
      data: {
        latitude,
        longitude,
        type: 'bin',
        acceptedAt: isAdmin ? new Date() : null,
        createdById: userId,
      },
    });
    return bin;
  }

  async getBinById(binId: number): Promise<Bin | null> {
    return this.db.bin.findUnique({
      where: { id: Number(binId) },
    });
  }

  async updateBinLocation(
    binId: number,
    latitude: number,
    longitude: number,
  ): Promise<Bin> {
    return this.db.bin.update({
      where: { id: Number(binId) },
      data: { latitude, longitude },
    });
  }

  async acceptBin(binId: number, accept: boolean): Promise<Bin> {
    return this.db.bin.update({
      where: { id: Number(binId) },
      data: { acceptedAt: accept ? new Date() : null },
    });
  }
}
