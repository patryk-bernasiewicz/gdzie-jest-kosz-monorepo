import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { ClerkService } from '../clerk/clerk.service';
import { UserService } from './user.service';

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
});
