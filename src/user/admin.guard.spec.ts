import { AdminGuard } from './admin.guard';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';

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

  it('should throw ForbiddenException if user is not admin', () => {
    const req = { user: { role: 'user' } };
    (mockContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: () => req,
    });
    expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException if user is missing', () => {
    const req = {};
    (mockContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: () => req,
    });
    expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(
      ForbiddenException,
    );
  });
});
