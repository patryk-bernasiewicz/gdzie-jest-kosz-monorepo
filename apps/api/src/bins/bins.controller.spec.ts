import { Test, TestingModule } from '@nestjs/testing';
import { BinsController } from './bins.controller';
import { BinsService } from './bins.service';
import { AuthService } from '../auth/auth.service';
import { Bin, User, Prisma } from '@prisma/client';
import { GetNearbyBinsDto } from './dto/get-nearby-bins.dto';
import { CreateBinDto } from './dto/create-bin.dto';
import { AcceptBinDto } from './dto/accept-bin.dto';
import { BinNotFoundException } from '../common/exceptions/bin.exceptions';

const mockUserRegular: User = { id: 1, clerkId: 'clerkUser1', role: 'user' };
const mockUserAdmin: User = { id: 2, clerkId: 'clerkAdmin1', role: 'admin' };

const createMockBin = (
  id: number,
  createdById: number,
  type: string = 'bin',
  overrides: Partial<Bin> = {},
): Bin => {
  const defaultLatitude = '0.0';
  const defaultLongitude = '0.0';
  return {
    id,
    type,
    latitude: new Prisma.Decimal(
      overrides.latitude?.toString() || defaultLatitude,
    ),
    longitude: new Prisma.Decimal(
      overrides.longitude?.toString() || defaultLongitude,
    ),
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    deletedAt: overrides.deletedAt === undefined ? null : overrides.deletedAt,
    acceptedAt:
      overrides.acceptedAt === undefined ? null : overrides.acceptedAt,
    createdById,
    ...overrides,
  } as Bin;
};

describe('BinsController', () => {
  let controller: BinsController;
  let binsServiceMock: Partial<BinsService>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    binsServiceMock = {
      getNearbyBins: jest.fn(),
      createBin: jest.fn(),
      getAllNearbyBins: jest.fn(),
      updateBinLocation: jest.fn(),
      acceptBin: jest.fn(),
      getBinById: jest.fn(),
      toggleBinVisibility: jest.fn(),
    };

    authServiceMock = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinsController],
      providers: [
        { provide: BinsService, useValue: binsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    controller = module.get<BinsController>(BinsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNearbyBins', () => {
    it('should return bins for valid coordinates', async () => {
      const bins: Bin[] = [
        createMockBin(1, 1, 'bin', {
          latitude: new Prisma.Decimal('1.0'),
          longitude: new Prisma.Decimal('1.0'),
        }),
      ];
      (binsServiceMock.getNearbyBins as jest.Mock).mockResolvedValue(bins);
      const dto: GetNearbyBinsDto = { latitude: 1.0, longitude: 1.0 };
      expect(await controller.getNearbyBins(dto)).toEqual(bins);
      expect(binsServiceMock.getNearbyBins).toHaveBeenCalledWith(1.0, 1.0);
    });
  });

  describe('createBin (AuthGuard dependent)', () => {
    beforeEach(() => {
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue(
        mockUserRegular,
      );
    });

    it('should create a bin with user info', async () => {
      const binDto: CreateBinDto = {
        latitude: 1.0,
        longitude: 1.0,
        type: 'bin',
      };
      const expectedBin = createMockBin(1, mockUserRegular.id, binDto.type, {
        latitude: new Prisma.Decimal(binDto.latitude),
        longitude: new Prisma.Decimal(binDto.longitude),
        acceptedAt: null,
      });
      (binsServiceMock.createBin as jest.Mock).mockResolvedValue(expectedBin);
      const result = await controller.createBin(binDto, mockUserRegular);
      expect(result).toEqual(expectedBin);
      expect(binsServiceMock.createBin).toHaveBeenCalledWith(
        binDto.latitude,
        binDto.longitude,
        mockUserRegular.id,
        false,
      );
    });

    it('should set isAdmin true if user is admin', async () => {
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue(
        mockUserAdmin,
      );
      const binDto: CreateBinDto = {
        latitude: 2.0,
        longitude: 2.0,
        type: 'bin',
      };
      const expectedBin = createMockBin(2, mockUserAdmin.id, binDto.type, {
        latitude: new Prisma.Decimal(binDto.latitude),
        longitude: new Prisma.Decimal(binDto.longitude),
        acceptedAt: new Date(),
      });
      (binsServiceMock.createBin as jest.Mock).mockResolvedValue(expectedBin);
      const result = await controller.createBin(binDto, mockUserAdmin);
      expect(result).toEqual(expectedBin);
      expect(binsServiceMock.createBin).toHaveBeenCalledWith(
        binDto.latitude,
        binDto.longitude,
        mockUserAdmin.id,
        true,
      );
    });
  });

  describe('Admin Routes (AuthGuard, AdminGuard dependent)', () => {
    beforeEach(() => {
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue(
        mockUserAdmin,
      );
    });

    it('getAllBinsAsAdmin should return bins', async () => {
      const bins: Bin[] = [createMockBin(1, mockUserAdmin.id, 'bin')];
      (binsServiceMock.getAllNearbyBins as jest.Mock).mockResolvedValue(bins);
      const dto: GetNearbyBinsDto = { latitude: 1.0, longitude: 1.0 };
      expect(await controller.getAllBinsAsAdmin(dto, mockUserAdmin)).toEqual(
        bins,
      );
      expect(binsServiceMock.getAllNearbyBins).toHaveBeenCalledWith(1.0, 1.0);
    });

    it('createBinAsAdmin should create a bin', async () => {
      const binDto: CreateBinDto = {
        latitude: 1.0,
        longitude: 1.0,
        type: 'bin',
      };
      const expectedBin = createMockBin(1, mockUserAdmin.id, binDto.type, {
        latitude: new Prisma.Decimal(binDto.latitude),
        longitude: new Prisma.Decimal(binDto.longitude),
        acceptedAt: new Date(),
      });
      (binsServiceMock.createBin as jest.Mock).mockResolvedValue(expectedBin);
      expect(await controller.createBinAsAdmin(binDto, mockUserAdmin)).toEqual(
        expectedBin,
      );
      expect(binsServiceMock.createBin).toHaveBeenCalledWith(
        binDto.latitude,
        binDto.longitude,
        mockUserAdmin.id,
        true,
      );
    });

    it('updateBinLocationAsAdmin should update bin', async () => {
      const binId = 1;
      const dto: CreateBinDto = { latitude: 1.1, longitude: 1.1, type: 'bin' };
      const targetBin = createMockBin(binId, mockUserAdmin.id, 'some_type');
      const updatedBin = createMockBin(binId, mockUserAdmin.id, dto.type, {
        latitude: new Prisma.Decimal(dto.latitude),
        longitude: new Prisma.Decimal(dto.longitude),
        acceptedAt: new Date(),
      });
      (binsServiceMock.getBinById as jest.Mock).mockResolvedValue(targetBin);
      (binsServiceMock.updateBinLocation as jest.Mock).mockResolvedValue(
        updatedBin,
      );
      expect(await controller.updateBinLocationAsAdmin(binId, dto)).toEqual(
        updatedBin,
      );
      expect(binsServiceMock.updateBinLocation).toHaveBeenCalledWith(
        binId,
        dto.latitude,
        dto.longitude,
      );
    });

    it('updateBinLocationAsAdmin should throw BinNotFoundException if bin not found', async () => {
      const binId = 99;
      const dto: CreateBinDto = { latitude: 1.1, longitude: 1.1, type: 'bin' };
      (binsServiceMock.getBinById as jest.Mock).mockResolvedValue(null);
      await expect(
        controller.updateBinLocationAsAdmin(binId, dto),
      ).rejects.toThrow(new BinNotFoundException(binId));
    });

    it('acceptBin should accept a bin', async () => {
      const binId = 1;
      const acceptDto: AcceptBinDto = { accept: true };
      const currentBin = createMockBin(binId, mockUserAdmin.id, 'bin', {
        acceptedAt: null,
      });
      const acceptedBin = { ...currentBin, acceptedAt: new Date() };
      (binsServiceMock.getBinById as jest.Mock).mockResolvedValue(currentBin);
      (binsServiceMock.acceptBin as jest.Mock).mockResolvedValue(acceptedBin);
      expect(await controller.acceptBin(binId, acceptDto)).toEqual(acceptedBin);
      expect(binsServiceMock.acceptBin).toHaveBeenCalledWith(binId, true);
    });

    it('acceptBin should reject a bin', async () => {
      const binId = 1;
      const acceptDto: AcceptBinDto = { accept: false };
      const currentBin = createMockBin(binId, mockUserAdmin.id, 'bin', {
        acceptedAt: new Date(),
      });
      const rejectedBin = { ...currentBin, acceptedAt: null };
      (binsServiceMock.getBinById as jest.Mock).mockResolvedValue(currentBin);
      (binsServiceMock.acceptBin as jest.Mock).mockResolvedValue(rejectedBin);
      expect(await controller.acceptBin(binId, acceptDto)).toEqual(rejectedBin);
      expect(binsServiceMock.acceptBin).toHaveBeenCalledWith(binId, false);
    });

    it('acceptBin should throw BinNotFoundException if bin not found', async () => {
      const binId = 99;
      const acceptDto: AcceptBinDto = { accept: true };
      (binsServiceMock.getBinById as jest.Mock).mockResolvedValue(null);
      await expect(controller.acceptBin(binId, acceptDto)).rejects.toThrow(
        new BinNotFoundException(binId),
      );
    });
  });

  describe('toggleBinVisibility', () => {
    it('should toggle visibility for existing bin', async () => {
      const binId = 1;
      const updatedBin = createMockBin(binId, mockUserAdmin.id, 'bin', {
        visibility: true,
      });
      (binsServiceMock.toggleBinVisibility as jest.Mock).mockResolvedValue(
        updatedBin,
      );
      const result = await controller.toggleBinVisibility(binId, {
        visibility: true,
      });
      expect(result).toEqual(updatedBin);
      expect(binsServiceMock.toggleBinVisibility).toHaveBeenCalledWith(
        binId,
        true,
      );
    });

    it('should throw BinNotFoundException for missing bin', async () => {
      const binId = 2;
      (binsServiceMock.toggleBinVisibility as jest.Mock).mockRejectedValue(
        new BinNotFoundException(binId),
      );
      await expect(
        controller.toggleBinVisibility(binId, { visibility: false }),
      ).rejects.toThrow(BinNotFoundException);
    });
  });
});
