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
    const connectSpy = jest.spyOn(service, '$connect').mockImplementation();
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });
});
