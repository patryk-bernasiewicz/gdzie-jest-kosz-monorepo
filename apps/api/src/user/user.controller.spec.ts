import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { ClerkService } from '../clerk/clerk.service';
import { UserService } from './user.service';
import { User } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let userService: Partial<UserService>;
  let clerkService: Partial<ClerkService>;

  beforeEach(async () => {
    userService = {};
    clerkService = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ClerkService, useValue: clerkService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Authenticate and Upsert', () => {
    it('should return the current user', async () => {
      const mockUser: User = {
        id: 1,
        clerkId: 'test-clerk-id',
        role: 'user',
      };

      // The @CurrentUser() decorator extracts the user from the request,
      // which is populated by the ClerkAuthGuard.
      // For this unit test, we directly pass the mockUser.
      const result = await controller.authenticateAndUpsert(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
