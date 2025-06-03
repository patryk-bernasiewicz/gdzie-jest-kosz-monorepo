import { Test, TestingModule } from '@nestjs/testing';
import { BinsController } from './bins.controller';
import { BinsService } from './bins.service';
import { UserService } from 'src/user/user.service';
import { Bin, User, Prisma } from '@prisma/client';
import { ClerkService } from '../clerk/clerk.service';
import { NotFoundException } from '@nestjs/common';
import { AcceptBinDto } from './dto/accept-bin.dto';
import { CreateBinDto } from './dto/create-bin.dto';
import { GetNearbyBinsDto } from './dto/get-nearby-bins.dto';
import { BinNotFoundException } from '../common/exceptions/bin.exceptions';

describe('BinsController', () => {
  let controller: BinsController;
  let binsService: any;
  let userService: Partial<UserService>;
  let clerkService: Partial<ClerkService>;

  beforeEach(async () => {
    binsService = {
      getNearbyBins: jest.fn(),
      createBin: jest.fn(),
      getAllNearbyBins: jest.fn(),
      updateBinLocation: jest.fn(),
      acceptBin: jest.fn(),
      getBinById: jest.fn(),
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
      const dto: GetNearbyBinsDto = { latitude: 1.12345678901234, longitude: 2.98765432109876 };
      const result = await controller.getNearbyBins(dto);
      expect(result).toEqual(bins);
      expect(binsService.getNearbyBins).toHaveBeenCalledWith(
        1.12345678901234,
        2.98765432109876,
      );
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
      const dto: CreateBinDto = { latitude: 1.12345678901234, longitude: 2.98765432109876, type: 'bin' };
      const result = await controller.createBin(dto, user);
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
      const dto: CreateBinDto = { latitude: 3.00000000000001, longitude: 4.00000000000002, type: 'bin' };
      const result = await controller.createBin(dto, user);
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
      const dto: GetNearbyBinsDto = { latitude: 10.1, longitude: 20.2 };
      const result = await controller.getAllBinsAsAdmin(dto, user);
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
      const dto: CreateBinDto = { latitude: 11.1, longitude: 22.2, type: 'bin' };
      const result = await controller.createBinAsAdmin(dto, user);
      expect(result).toEqual(bin);
      expect(binsService.createBin).toHaveBeenCalledWith(11.1, 22.2, 4, true);
    });
  });

  describe('updateBinLocationAsAdmin', () => {
    it('should update bin location as admin', async () => {
      const binId = 12;
      const updatedLatitude = 33.3;
      const updatedLongitude = 44.4;
      const mockBin: Bin = {
        id: binId,
        type: 'bin',
        latitude: new Prisma.Decimal(updatedLatitude),
        longitude: new Prisma.Decimal(updatedLongitude),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        acceptedAt: new Date(),
        createdById: 5,
      };
      binsService.getBinById.mockResolvedValue(mockBin);
      binsService.updateBinLocation.mockResolvedValue(mockBin);
      const dto: CreateBinDto = { latitude: updatedLatitude, longitude: updatedLongitude, type: 'bin' };
      const result = await controller.updateBinLocationAsAdmin(
        binId,
        dto,
      );
      expect(result).toEqual(mockBin);
      expect(binsService.updateBinLocation).toHaveBeenCalledWith(
        binId,
        updatedLatitude,
        updatedLongitude,
      );
    });

    it('should throw BinNotFoundException if bin does not exist', async () => {
      const binId = 99;
      binsService.getBinById.mockResolvedValue(null);
      const dto: CreateBinDto = { latitude: 10, longitude: 20, type: 'bin' };
      await expect(
        controller.updateBinLocationAsAdmin(binId, dto),
      ).rejects.toThrow(BinNotFoundException);
      expect(binsService.getBinById).toHaveBeenCalledWith(binId);
      expect(binsService.updateBinLocation).not.toHaveBeenCalled();
    });
  });

  describe('acceptBin', () => {
    const binId = 1;
    const acceptBinDto: AcceptBinDto = { accept: true };
    const mockUser: User = { id: 1, clerkId: 'clerk-admin', role: 'admin' };

    const mockAcceptedBin: Bin = {
      id: binId,
      type: 'bin',
      latitude: new Prisma.Decimal('10.0'),
      longitude: new Prisma.Decimal('20.0'),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      acceptedAt: new Date(),
      createdById: mockUser.id,
    };

    const mockRejectedBin: Bin = {
      ...mockAcceptedBin,
      acceptedAt: null,
    };

    it('should call binsService.acceptBin with true and return accepted bin', async () => {
      binsService.getBinById.mockResolvedValue(mockAcceptedBin);
      binsService.acceptBin.mockResolvedValue(mockAcceptedBin);

      const result = await controller.acceptBin(binId, acceptBinDto);

      expect(binsService.getBinById).toHaveBeenCalledWith(binId);
      expect(binsService.acceptBin).toHaveBeenCalledWith(binId, true);
      expect(result).toEqual(mockAcceptedBin);
    });

    it('should call binsService.acceptBin with false and return rejected bin', async () => {
      const rejectDto: AcceptBinDto = { accept: false };
      binsService.getBinById.mockResolvedValue(mockRejectedBin);
      binsService.acceptBin.mockResolvedValue(mockRejectedBin);

      const result = await controller.acceptBin(binId, rejectDto);

      expect(binsService.getBinById).toHaveBeenCalledWith(binId);
      expect(binsService.acceptBin).toHaveBeenCalledWith(binId, false);
      expect(result).toEqual(mockRejectedBin);
    });

    it('should throw BinNotFoundException if bin is not found', async () => {
      const binId = 1;
      binsService.getBinById.mockResolvedValue(null);
      const acceptBinDto: AcceptBinDto = { accept: false };
      await expect(controller.acceptBin(binId, acceptBinDto)).rejects.toThrow(BinNotFoundException);
      expect(binsService.getBinById).toHaveBeenCalledWith(binId);
    });

    it('should propagate error if binsService.acceptBin throws', async () => {
      const errorMessage = 'Service error';
      binsService.getBinById.mockResolvedValue(mockAcceptedBin);
      binsService.acceptBin.mockRejectedValue(new Error(errorMessage));

      await expect(controller.acceptBin(binId, acceptBinDto)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
