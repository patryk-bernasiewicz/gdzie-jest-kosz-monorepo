import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
// import { ClerkService } from '../clerk/clerk.service'; // No longer needed if AuthService is fully mocked
// import { UserService } from './user.service'; // No longer needed if AuthService is fully mocked
import { AuthService } from '../auth/auth.service';
import { User } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let authServiceMock: Partial<AuthService>; // Mock AuthService

  beforeEach(async () => {
    authServiceMock = {
      validateUser: jest.fn(), // Mock the validateUser method used by AuthGuard
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        // No need to provide UserService or ClerkService if UserController doesn't use them
        // and AuthService is mocked (AuthGuard will use the mocked AuthService)
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Authenticate and Upsert', () => {
    it('should return the current user', () => {
      const mockUser: User = {
        id: 1,
        clerkId: 'test-clerk-id',
        role: 'user',
      };

      // If AuthGuard were running, it would call authService.validateUser.
      // We can set up the mock for completeness, though our direct call to the controller method
      // with mockUser bypasses the guard's full execution path for this specific call.
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue(mockUser);

      // In a unit test of the controller method, we assume the guard/decorator
      // has already done its job and provided the user.
      const result = controller.authenticateAndUpsert(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
