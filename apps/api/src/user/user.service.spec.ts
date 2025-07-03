import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let db: { user: { upsert: jest.Mock } };

  beforeEach(async () => {
    db = {
      user: {
        upsert: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: DatabaseService, useValue: db },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();
    service = module.get(UserService);
  });

  describe('upsertUser', () => {
    it('should upsert and return user if user does not exist', async () => {
      const user: User = { id: 1, clerkId: 'clerk-123', role: 'user' };
      db.user.upsert.mockResolvedValue(user);
      const result = await service.upsertUser('clerk-123');
      expect(db.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-123' },
        update: {},
        create: { clerkId: 'clerk-123' },
      });
      expect(result).toEqual(user);
    });

    it('should upsert and return user if user already exists', async () => {
      const user: User = { id: 2, clerkId: 'clerk-456', role: 'admin' };
      db.user.upsert.mockResolvedValue(user);
      const result = await service.upsertUser('clerk-456');
      expect(db.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-456' },
        update: {},
        create: { clerkId: 'clerk-456' },
      });
      expect(result).toEqual(user);
    });

    it('should throw an error if upsert fails', async () => {
      db.user.upsert.mockRejectedValue(new Error('DB error'));
      await expect(service.upsertUser('clerk-err')).rejects.toThrow(
        'Failed to create or update user account',
      );
    });
  });
});
