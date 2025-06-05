import { Test, TestingModule } from '@nestjs/testing';
import { BinsService } from './bins.service';
import { DatabaseService } from 'src/database/database.service';
import { Bin, Prisma } from '@prisma/client';
import {
  NEARBY_BINS_DELTA_USER,
  NEARBY_BINS_DELTA_ADMIN,
} from './bins.constants';
import { InvalidLocationException } from '../common/exceptions/bin.exceptions';

describe('BinsService', () => {
  let service: BinsService;
  let db: { bin: any };

  beforeEach(async () => {
    db = {
      bin: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinsService, { provide: DatabaseService, useValue: db }],
    }).compile();
    service = module.get(BinsService);
  });

  describe('getNearbyBins', () => {
    it('should query bins within 0.01 of given coordinates and return result', async () => {
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
      expect(callArgs.where.latitude.gte).toBeCloseTo(
        1.1 - NEARBY_BINS_DELTA_USER,
        10,
      );
      expect(callArgs.where.latitude.lte).toBeCloseTo(
        1.1 + NEARBY_BINS_DELTA_USER,
        10,
      );
      expect(callArgs.where.longitude.gte).toBeCloseTo(
        2.2 - NEARBY_BINS_DELTA_USER,
        10,
      );
      expect(callArgs.where.longitude.lte).toBeCloseTo(
        2.2 + NEARBY_BINS_DELTA_USER,
        10,
      );
      expect(callArgs.where.NOT).toEqual({ acceptedAt: null });
      expect(result).toEqual(bins);
    });

    it('should throw an error if db call fails', async () => {
      db.bin.findMany.mockRejectedValue(new Error('DB Test Error'));
      await expect(service.getNearbyBins(1.1, 2.2)).rejects.toThrow(
        'DB Test Error',
      );
    });
  });

  describe('getAllNearbyBins', () => {
    it('should query bins within admin delta and return result', async () => {
      const bins: Bin[] = [
        {
          id: 1,
          type: 'bin',
          latitude: new Prisma.Decimal(1.1),
          longitude: new Prisma.Decimal(2.2),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          acceptedAt: new Date(), // Can be accepted
          createdById: 1,
        },
        {
          id: 2,
          type: 'bin',
          latitude: new Prisma.Decimal(1.105),
          longitude: new Prisma.Decimal(2.205),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          acceptedAt: null, // Can be unaccepted
          createdById: 2,
        },
      ];
      db.bin.findMany.mockResolvedValue(bins);
      const result = await service.getAllNearbyBins(1.1, 2.2);
      const callArgs = db.bin.findMany.mock.calls[0][0];
      // Using NEARBY_BINS_DELTA_ADMIN from BinsService, actual value not needed for mock
      expect(callArgs.where.latitude.gte).toBeCloseTo(
        1.1 - NEARBY_BINS_DELTA_ADMIN,
        5,
      );
      expect(callArgs.where.latitude.lte).toBeCloseTo(
        1.1 + NEARBY_BINS_DELTA_ADMIN,
        5,
      );
      expect(callArgs.where.longitude.gte).toBeCloseTo(
        2.2 - NEARBY_BINS_DELTA_ADMIN,
        5,
      );
      expect(callArgs.where.longitude.lte).toBeCloseTo(
        2.2 + NEARBY_BINS_DELTA_ADMIN,
        5,
      );
      expect(callArgs.where.NOT).toBeUndefined(); // Should not filter by acceptedAt
      expect(result).toEqual(bins);
    });

    it('should throw an error if db call fails', async () => {
      db.bin.findMany.mockRejectedValue(new Error('DB Test Error'));
      await expect(service.getAllNearbyBins(1.1, 2.2)).rejects.toThrow(
        'DB Test Error',
      );
    });

    it('should call validateCoordinates and throw if invalid', async () => {
      // This test implicitly checks if validateCoordinates is called
      // by getAllNearbyBins, as validateCoordinates throws for invalid coords.
      await expect(service.getAllNearbyBins(100, 200)).rejects.toThrow(
        InvalidLocationException,
      );
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

    it('should throw an error if db call fails', async () => {
      db.bin.create.mockRejectedValue(new Error('DB Test Error'));
      await expect(service.createBin(1, 1, 1, false)).rejects.toThrow(
        'DB Test Error',
      );
    });
  });

  describe('updateBinLocation', () => {
    it('should update bin location and return updated bin', async () => {
      const updatedBin: Bin = {
        id: 10,
        type: 'bin',
        latitude: new Prisma.Decimal(12.34),
        longitude: new Prisma.Decimal(56.78),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: null,
        createdById: 2,
      };
      db.bin.update = jest.fn().mockResolvedValue(updatedBin);
      const result = await service.updateBinLocation(10, 12.34, 56.78);
      expect(db.bin.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { latitude: 12.34, longitude: 56.78 },
      });
      expect(result).toEqual(updatedBin);
    });

    it('should throw an error if db call fails', async () => {
      db.bin.update.mockRejectedValue(new Error('DB Test Error'));
      await expect(service.updateBinLocation(10, 12.34, 56.78)).rejects.toThrow(
        'DB Test Error',
      );
    });
  });

  describe('getBinById', () => {
    it('should return bin when found', async () => {
      const binId = 5;
      const bin: Bin = {
        id: binId,
        type: 'bin',
        latitude: new Prisma.Decimal('15.5'),
        longitude: new Prisma.Decimal('25.5'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: new Date(),
        createdById: 3,
      };
      db.bin.findUnique.mockResolvedValue(bin);

      const result = await service.getBinById(binId);

      expect(db.bin.findUnique).toHaveBeenCalledWith({
        where: { id: Number(binId) },
      });
      expect(result).toEqual(bin);
    });

    it('should return null when bin is not found', async () => {
      const binId = 999;
      db.bin.findUnique.mockResolvedValue(null);

      const result = await service.getBinById(binId);

      expect(db.bin.findUnique).toHaveBeenCalledWith({
        where: { id: Number(binId) },
      });
      expect(result).toBeNull();
    });

    it('should convert binId to Number if provided as string', async () => {
      const binIdString = '7';
      const binIdNumber = 7;
      const bin: Bin = {
        id: binIdNumber,
        type: 'bin',
        latitude: new Prisma.Decimal('17.7'),
        longitude: new Prisma.Decimal('27.7'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: null,
        createdById: 4,
      };
      db.bin.findUnique.mockResolvedValue(bin);

      const result = await service.getBinById(binIdString as any as number);

      expect(db.bin.findUnique).toHaveBeenCalledWith({
        where: { id: binIdNumber },
      });
      expect(result).toEqual(bin);
    });

    it('should throw an error if db call fails', async () => {
      db.bin.findUnique.mockRejectedValue(new Error('DB Test Error'));
      await expect(service.getBinById(1)).rejects.toThrow('DB Test Error');
    });
  });

  describe('acceptBin', () => {
    it('should update bin with acceptedAt set to current date if accept is true', async () => {
      const binId = 1;
      const acceptedBin: Bin = {
        id: binId,
        type: 'bin',
        latitude: new Prisma.Decimal('10.0'),
        longitude: new Prisma.Decimal('20.0'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: new Date(),
        createdById: 1,
      };
      db.bin.update.mockResolvedValue(acceptedBin);

      const result = await service.acceptBin(binId, true);

      expect(db.bin.update).toHaveBeenCalledWith({
        where: { id: binId },
        data: { acceptedAt: expect.any(Date) },
      });
      expect(result).toEqual(acceptedBin);
      expect(result.acceptedAt).toBeInstanceOf(Date);
    });

    it('should update bin with acceptedAt set to null if accept is false', async () => {
      const binId = 2;
      const rejectedBin: Bin = {
        id: binId,
        type: 'bin',
        latitude: new Prisma.Decimal('10.0'),
        longitude: new Prisma.Decimal('20.0'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: null,
        createdById: 1,
      };
      db.bin.update.mockResolvedValue(rejectedBin);

      const result = await service.acceptBin(binId, false);

      expect(db.bin.update).toHaveBeenCalledWith({
        where: { id: binId },
        data: { acceptedAt: null },
      });
      expect(result).toEqual(rejectedBin);
      expect(result.acceptedAt).toBeNull();
    });

    it('should convert binId to Number if provided as string (though service expects number)', async () => {
      const binIdString = '3';
      const binIdNumber = 3;
      const acceptedBin: Bin = {
        id: binIdNumber,
        type: 'bin',
        latitude: new Prisma.Decimal('10.0'),
        longitude: new Prisma.Decimal('20.0'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: new Date(),
        createdById: 1,
      };
      db.bin.update.mockResolvedValue(acceptedBin);

      const result = await service.acceptBin(
        binIdString as any as number,
        true,
      );

      expect(db.bin.update).toHaveBeenCalledWith({
        where: { id: binIdNumber },
        data: { acceptedAt: expect.any(Date) },
      });
      expect(result).toEqual(acceptedBin);
    });

    it('should throw an error if db call fails', async () => {
      db.bin.update.mockRejectedValue(new Error('DB Test Error'));
      await expect(service.acceptBin(1, true)).rejects.toThrow('DB Test Error');
    });
  });

  describe('validateCoordinates', () => {
    it('should throw InvalidLocationException for latitude < -90', () => {
      expect(() => service['validateCoordinates'](-90.1, 0)).toThrow(
        InvalidLocationException,
      );
    });

    it('should throw InvalidLocationException for latitude > 90', () => {
      expect(() => service['validateCoordinates'](90.1, 0)).toThrow(
        InvalidLocationException,
      );
    });

    it('should throw InvalidLocationException for longitude < -180', () => {
      expect(() => service['validateCoordinates'](0, -180.1)).toThrow(
        InvalidLocationException,
      );
    });

    it('should throw InvalidLocationException for longitude > 180', () => {
      expect(() => service['validateCoordinates'](0, 180.1)).toThrow(
        InvalidLocationException,
      );
    });

    it('should throw InvalidLocationException for NaN latitude', () => {
      expect(() => service['validateCoordinates'](NaN, 0)).toThrow(
        InvalidLocationException,
      );
    });

    it('should throw InvalidLocationException for NaN longitude', () => {
      expect(() => service['validateCoordinates'](0, NaN)).toThrow(
        InvalidLocationException,
      );
    });

    it('should not throw for valid coordinates (within bounds)', () => {
      expect(() => service['validateCoordinates'](0, 0)).not.toThrow();
      expect(() => service['validateCoordinates'](90, 180)).not.toThrow();
      expect(() => service['validateCoordinates'](-90, -180)).not.toThrow();
    });
  });
});
