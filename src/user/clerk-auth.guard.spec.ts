import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { UserService } from './user.service';
import { ExecutionContext } from '@nestjs/common';
import { ClerkService } from '../clerk/clerk.service';

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

  it('should return false if no Authorization header', async () => {
    request.headers = {};
    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });

  it('should return false if Authorization header is not Bearer', async () => {
    request.headers = { authorization: 'Basic xyz' };
    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });

  it('should return false if token is missing after Bearer', async () => {
    request.headers = { authorization: 'Bearer ' };
    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });

  it('should return false if Clerk token verification fails', async () => {
    request.headers = { authorization: 'Bearer token123' };
    (clerkService.verifyToken as jest.Mock).mockRejectedValue(
      new Error('Invalid token'),
    );
    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });

  it('should return false if Clerk session retrieval fails', async () => {
    request.headers = { authorization: 'Bearer token123' };
    (clerkService.verifyToken as jest.Mock).mockResolvedValue({
      sid: 'sid123',
    });
    (clerkService.getSession as jest.Mock).mockRejectedValue(
      new Error('No session'),
    );
    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
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
