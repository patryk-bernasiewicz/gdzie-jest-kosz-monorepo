import { Test, TestingModule } from '@nestjs/testing';
import { BinsController } from './bins.controller';
import { BinsService } from './bins.service';
import { UserService } from 'src/user/user.service';
import { Bin, User, Prisma } from '@prisma/client';
import { ClerkService } from '../clerk/clerk.service';

describe('BinsController', () => {
  let controller: BinsController;
  let binsService: any;
  let userService: Partial<UserService>;
  let clerkService: Partial<ClerkService>;

  beforeEach(async () => {
    binsService = {
      getNearbyBins: jest.fn(),
      createBin: jest.fn(),
    };
    userService = {};
    clerkService = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinsController],
      providers: [
        { provide: BinsService, useValue: binsService },
        { provide: UserService, useValue: userService },
        { provide: ClerkService, useValue: clerkService },
      ],
    }).compile();

    controller = module.get<BinsController>(BinsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNearbyBins', () => {
    it('should return bins for valid coordinates', async () => {
      const bins: Bin[] = [
        {
          id: 1,
          type: 'bin',
          latitude: new Prisma.Decimal('1.12345678901234'),
          longitude: new Prisma.Decimal('2.98765432109876'),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          acceptedAt: new Date(),
          createdById: 1,
        },
      ];
      binsService.getNearbyBins.mockResolvedValue(bins);
      const result = await controller.getNearbyBins(
        1.12345678901234,
        2.98765432109876,
      );
      expect(result).toEqual(bins);
      expect(binsService.getNearbyBins).toHaveBeenCalledWith(
        1.12345678901234,
        2.98765432109876,
      );
    });
    it('should return empty array if coordinates are missing', async () => {
      const result = await controller.getNearbyBins(undefined, undefined);
      expect(result).toEqual([]);
    });
  });

  describe('createBin', () => {
    it('should create a bin with user info', async () => {
      const bin: Bin = {
        id: 1,
        type: 'bin',
        latitude: new Prisma.Decimal('1.12345678901234'),
        longitude: new Prisma.Decimal('2.98765432109876'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: null,
        createdById: 1,
      };
      const user: User = { id: 1, clerkId: 'clerk1', role: 'user' };
      binsService.createBin.mockResolvedValue(bin);
      const result = await controller.createBin(
        1.12345678901234,
        2.98765432109876,
        user,
      );
      expect(result).toEqual(bin);
      expect(binsService.createBin).toHaveBeenCalledWith(
        1.12345678901234,
        2.98765432109876,
        1,
        false,
      );
    });
    it('should set isAdmin true if user is admin', async () => {
      const bin: Bin = {
        id: 2,
        type: 'bin',
        latitude: new Prisma.Decimal('3.00000000000001'),
        longitude: new Prisma.Decimal('4.00000000000002'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: new Date(),
        createdById: 2,
      };
      const user: User = { id: 2, clerkId: 'clerk2', role: 'admin' };
      binsService.createBin.mockResolvedValue(bin);
      const result = await controller.createBin(
        3.00000000000001,
        4.00000000000002,
        user,
      );
      expect(result).toEqual(bin);
      expect(binsService.createBin).toHaveBeenCalledWith(
        3.00000000000001,
        4.00000000000002,
        2,
        true,
      );
    });
  });

  describe('getAllBinsAsAdmin', () => {
    it('should return bins for admin with valid coordinates', async () => {
      const bins: Bin[] = [
        {
          id: 10,
          type: 'bin',
          latitude: new Prisma.Decimal('10.1'),
          longitude: new Prisma.Decimal('20.2'),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          acceptedAt: new Date(),
          createdById: 3,
        },
      ];
      binsService.getAllNearbyBins = jest.fn().mockResolvedValue(bins);
      const user: User = { id: 3, clerkId: 'clerk3', role: 'admin' };
      const result = await controller.getAllBinsAsAdmin(10.1, 20.2, user);
      expect(result).toEqual(bins);
      expect(binsService.getAllNearbyBins).toHaveBeenCalledWith(10.1, 20.2);
    });
  });

  describe('createBinAsAdmin', () => {
    it('should create a bin as admin', async () => {
      const bin: Bin = {
        id: 11,
        type: 'bin',
        latitude: new Prisma.Decimal('11.1'),
        longitude: new Prisma.Decimal('22.2'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: new Date(),
        createdById: 4,
      };
      binsService.createBin = jest.fn().mockResolvedValue(bin);
      const user: User = { id: 4, clerkId: 'clerk4', role: 'admin' };
      const result = await controller.createBinAsAdmin(11.1, 22.2, user);
      expect(result).toEqual(bin);
      expect(binsService.createBin).toHaveBeenCalledWith(11.1, 22.2, 4, true);
    });
  });

  describe('updateBinLocationAsAdmin', () => {
    it('should update bin location as admin', async () => {
      const bin: Bin = {
        id: 12,
        type: 'bin',
        latitude: new Prisma.Decimal('33.3'),
        longitude: new Prisma.Decimal('44.4'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: new Date(),
        createdById: 5,
      };
      binsService.updateBinLocation = jest.fn().mockResolvedValue(bin);
      const result = await controller.updateBinLocationAsAdmin(12, 33.3, 44.4);
      expect(result).toEqual(bin);
      expect(binsService.updateBinLocation).toHaveBeenCalledWith(
        12,
        33.3,
        44.4,
      );
    });
  });
});
