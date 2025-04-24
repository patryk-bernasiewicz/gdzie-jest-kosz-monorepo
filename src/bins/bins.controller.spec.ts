import { Test, TestingModule } from '@nestjs/testing';
import { BinsController } from './bins.controller';
import { BinsService } from './bins.service';
import { UserService } from 'src/user/user.service';
import { Bin, User, Prisma } from '@prisma/client';

describe('BinsController', () => {
  let controller: BinsController;
  let binsService: BinsService;
  let userService: UserService;

  const mockBinsService = {
    getNearbyBins: jest.fn(),
    createBin: jest.fn(),
  };

  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinsController],
      providers: [
        { provide: BinsService, useValue: mockBinsService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<BinsController>(BinsController);
    binsService = module.get<BinsService>(BinsService);
    userService = module.get<UserService>(UserService);
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
      mockBinsService.getNearbyBins.mockResolvedValue(bins);
      const result = await controller.getNearbyBins(
        1.12345678901234,
        2.98765432109876,
      );
      expect(result).toEqual(bins);
      expect(mockBinsService.getNearbyBins).toHaveBeenCalledWith(
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
      mockBinsService.createBin.mockResolvedValue(bin);
      const result = await controller.createBin(
        1.12345678901234,
        2.98765432109876,
        user,
      );
      expect(result).toEqual(bin);
      expect(mockBinsService.createBin).toHaveBeenCalledWith(
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
      mockBinsService.createBin.mockResolvedValue(bin);
      const result = await controller.createBin(
        3.00000000000001,
        4.00000000000002,
        user,
      );
      expect(result).toEqual(bin);
      expect(mockBinsService.createBin).toHaveBeenCalledWith(
        3.00000000000001,
        4.00000000000002,
        2,
        true,
      );
    });
  });
});
