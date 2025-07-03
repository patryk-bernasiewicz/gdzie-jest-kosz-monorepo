import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

/**
 * Extracts the user object attached to the request by the AuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // Assumes AuthGuard has set request.user
    return request.user;
  },
);
