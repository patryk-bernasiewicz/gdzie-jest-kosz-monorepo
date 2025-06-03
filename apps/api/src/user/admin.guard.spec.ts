import { AdminGuard } from './admin.guard';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { InsufficientPermissionsException } from '../common/exceptions/auth.exceptions';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockContext: Partial<ExecutionContext>;

  beforeEach(() => {
    guard = new AdminGuard();
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    };
  });

  it('should allow access if user is admin', () => {
    const req = { user: { role: 'admin' } };
    (mockContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: () => req,
    });
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
  });

  it('should throw InsufficientPermissionsException if user is not admin', () => {
    const req = { user: { id: 1, role: 'user' } };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    };
    expect(() => guard.canActivate(mockContext as any)).toThrow(InsufficientPermissionsException);
  });

  it('should throw InsufficientPermissionsException if user is missing', () => {
    const req = {};
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    };
    expect(() => guard.canActivate(mockContext as any)).toThrow(InsufficientPermissionsException);
  });
});
