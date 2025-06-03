import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Extracts the user object attached to the request by the AuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest();
    // Assumes AuthGuard has set request.user
    return request.user as User | undefined;
  },
); 