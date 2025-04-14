import { Injectable } from '@nestjs/common';
import { Bin } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

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

  async createBin(
    latitude: number,
    longitude: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<Bin> {
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
}
