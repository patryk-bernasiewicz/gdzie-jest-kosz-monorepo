import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database/database.service';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let db: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    db = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: DatabaseService, useValue: db },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!');
    });
  });

  describe('getHealth', () => {
    it('should return "OK" when database connection succeeds', async () => {
      db.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      const result = await service.getHealth();
      expect(result).toBe('OK');
      expect(db.$queryRaw).toHaveBeenCalled();
    });

    it('should return "Database connection failed" when database connection fails', async () => {
      db.$queryRaw.mockRejectedValue(new Error('Connection failed'));
      const result = await service.getHealth();
      expect(result).toBe('Database connection failed');
      expect(db.$queryRaw).toHaveBeenCalled();
    });
  });
});
