import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { Logger } from '@nestjs/common';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();
    service = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on onModuleInit', async () => {
    service.$connect = jest.fn();
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });
});
