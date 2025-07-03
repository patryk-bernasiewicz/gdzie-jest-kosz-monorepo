import { Test, TestingModule } from '@nestjs/testing';
import { ClerkService } from './clerk.service';
import { Logger } from '@nestjs/common';
// We don't need to import clerkClient here anymore as it's fully mocked.

// Mock the clerkClient and its methods directly within the factory
jest.mock('@clerk/clerk-sdk-node', () => ({
  __esModule: true,
  default: {
    verifyToken: jest.fn(), // Define mock function inline
    sessions: {
      getSession: jest.fn(), // Define mock function inline
    },
  },
}));

// We need to import the mocked client to access its mocked methods for assertions/reset
import clerkClient from '@clerk/clerk-sdk-node';

// Suppress logger output for tests
Logger.overrideLogger(false);

describe('ClerkService', () => {
  let service: ClerkService;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkService,
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<ClerkService>(ClerkService);
    // Reset mocks before each test using the imported mock client
    (clerkClient.verifyToken as jest.Mock).mockReset();
    (clerkClient.sessions.getSession as jest.Mock).mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should call clerkClient.verifyToken and return its result', async () => {
      const token = 'test-token';
      const expectedResult = { sid: 'test-session-id' };
      (clerkClient.verifyToken as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.verifyToken(token);

      expect(clerkClient.verifyToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if clerkClient.verifyToken throws', async () => {
      const token = 'test-token';
      const error = new Error('Verification failed');
      (clerkClient.verifyToken as jest.Mock).mockRejectedValue(error);

      await expect(service.verifyToken(token)).rejects.toThrow(error);
    });
  });

  describe('getSession', () => {
    it('should call clerkClient.sessions.getSession and return its result', async () => {
      const sid = 'test-session-id';
      const expectedResult = { userId: 'test-user-id' };
      (clerkClient.sessions.getSession as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.getSession(sid);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const getSessionMock = clerkClient.sessions.getSession as jest.Mock;
      expect(getSessionMock).toHaveBeenCalledWith(sid);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if clerkClient.sessions.getSession throws', async () => {
      const sid = 'test-session-id';
      const error = new Error('Session retrieval failed');
      (clerkClient.sessions.getSession as jest.Mock).mockRejectedValue(error);

      await expect(service.getSession(sid)).rejects.toThrow(
        'Session retrieval failed',
      );
    });
  });
});
