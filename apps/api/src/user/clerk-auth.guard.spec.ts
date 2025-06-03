import { ClerkAuthGuard } from './clerk-auth.guard';
import { UserService } from './user.service';
import { ExecutionContext } from '@nestjs/common';
import { ClerkService } from '../clerk/clerk.service';
import { MissingTokenException, InvalidTokenException } from '../common/exceptions/auth.exceptions';

jest.mock('@clerk/clerk-sdk-node', () => ({
  __esModule: true,
  default: {
    verifyToken: jest.fn(),
    sessions: {
      getSession: jest.fn(),
    },
  },
}));
import clerkClient from '@clerk/clerk-sdk-node';

const mockUserService = {
  upsertUser: jest.fn(),
};

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  let userService: Partial<UserService>;
  let clerkService: Partial<ClerkService>;
  let context: Partial<ExecutionContext>;
  let request: any;

  beforeEach(() => {
    process.env.CLERK_PUBLISHABLE_KEY = 'test-pub-key';
    process.env.CLERK_SECRET_KEY = 'test-secret-key';
    jest.resetAllMocks();
    userService = {};
    clerkService = {
      verifyToken: jest.fn(),
      getSession: jest.fn(),
    };
    guard = new ClerkAuthGuard(userService as any, clerkService as any);
    request = { headers: {}, user: undefined };
    context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as any;
  });

  afterEach(() => {
    delete process.env.CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  it('should throw MissingTokenException if no Authorization header', async () => {
    const req = { headers: {} };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    };
    await expect(guard.canActivate(mockContext as any)).rejects.toThrow(MissingTokenException);
  });

  it('should throw MissingTokenException if Authorization header is not Bearer', async () => {
    const req = { headers: { authorization: 'Basic xyz' } };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    };
    await expect(guard.canActivate(mockContext as any)).rejects.toThrow(MissingTokenException);
  });

  it('should throw MissingTokenException if token is missing after Bearer', async () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    };
    await expect(guard.canActivate(mockContext as any)).rejects.toThrow(MissingTokenException);
  });

  it('should throw InvalidTokenException if Clerk token verification fails', async () => {
    guard['clerkService'].verifyToken = jest.fn().mockRejectedValue(new Error('Invalid token'));
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    };
    await expect(guard.canActivate(mockContext as any)).rejects.toThrow(InvalidTokenException);
  });

  it('should throw InvalidTokenException if Clerk session retrieval fails', async () => {
    guard['clerkService'].verifyToken = jest.fn().mockResolvedValue({ sid: 'sid' });
    guard['clerkService'].getSession = jest.fn().mockRejectedValue(new Error('No session'));
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    };
    await expect(guard.canActivate(mockContext as any)).rejects.toThrow(InvalidTokenException);
  });

  it('should upsert user and attach to request if token and session are valid', async () => {
    request.headers = { authorization: 'Bearer token123' };
    (clerkService.verifyToken as jest.Mock).mockResolvedValue({
      sid: 'sid123',
    });
    (clerkService.getSession as jest.Mock).mockResolvedValue({
      userId: 'user-abc',
    });
    const user = { id: 1, clerkId: 'user-abc', role: 'user' };
    userService.upsertUser = jest.fn().mockResolvedValue(user);
    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(true);
    expect(request.user).toEqual(user);
    expect(userService.upsertUser).toHaveBeenCalledWith('user-abc');
  });
});
