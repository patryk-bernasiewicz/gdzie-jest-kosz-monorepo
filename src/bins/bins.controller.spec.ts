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
});
