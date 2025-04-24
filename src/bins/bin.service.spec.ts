import { Test, TestingModule } from '@nestjs/testing';
import { BinsService } from './bins.service';
import { DatabaseService } from 'src/database/database.service';
import { Bin, Prisma } from '@prisma/client';

describe('BinsService', () => {
  let service: BinsService;
  let db: { bin: any };

  beforeEach(async () => {
    db = {
      bin: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinsService, { provide: DatabaseService, useValue: db }],
    }).compile();
    service = module.get(BinsService);
  });

  describe('getNearbyBins', () => {
    it('should query bins within 0.1 of given coordinates and return result', async () => {
      const bins: Bin[] = [
        {
          id: 1,
          type: 'bin',
          latitude: new Prisma.Decimal(1.1),
          longitude: new Prisma.Decimal(2.2),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          acceptedAt: new Date(),
          createdById: 1,
        },
      ];
      db.bin.findMany.mockResolvedValue(bins);
      const result = await service.getNearbyBins(1.1, 2.2);
      const callArgs = db.bin.findMany.mock.calls[0][0];
      expect(callArgs.where.latitude.gte).toBeCloseTo(1.0, 10);
      expect(callArgs.where.latitude.lte).toBeCloseTo(1.2, 10);
      expect(callArgs.where.longitude.gte).toBeCloseTo(2.1, 10);
      expect(callArgs.where.longitude.lte).toBeCloseTo(2.3, 10);
      expect(callArgs.where.NOT).toEqual({ acceptedAt: null });
      expect(result).toEqual(bins);
    });
  });

  describe('createBin', () => {
    it('should create a bin for a regular user (not admin)', async () => {
      const bin: Bin = {
        id: 2,
        type: 'bin',
        latitude: new Prisma.Decimal(3.3),
        longitude: new Prisma.Decimal(4.4),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: null,
        createdById: 5,
      };
      db.bin.create.mockResolvedValue(bin);
      const result = await service.createBin(3.3, 4.4, 5, false);
      expect(db.bin.create).toHaveBeenCalledWith({
        data: {
          latitude: 3.3,
          longitude: 4.4,
          type: 'bin',
          acceptedAt: null,
          createdById: 5,
        },
      });
      expect(result).toEqual(bin);
    });
    it('should create a bin for an admin and set acceptedAt', async () => {
      const now = new Date();
      const bin: Bin = {
        id: 3,
        type: 'bin',
        latitude: new Prisma.Decimal(5.5),
        longitude: new Prisma.Decimal(6.6),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        acceptedAt: now,
        createdById: 7,
      };
      db.bin.create.mockResolvedValue(bin);
      const result = await service.createBin(5.5, 6.6, 7, true);
      // acceptedAt should be a Date (any Date instance)
      expect(db.bin.create.mock.calls[0][0].data.acceptedAt).toBeInstanceOf(
        Date,
      );
      expect(db.bin.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          latitude: 5.5,
          longitude: 6.6,
          type: 'bin',
          createdById: 7,
        }),
      });
      expect(result).toEqual(bin);
    });
  });
});
