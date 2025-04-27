import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ClerkService } from '../clerk/clerk.service';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly clerkService: ClerkService,
  ) {}

  logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
      console.error(
        'Clerk environment variables missing: CLERK_PUBLISHABLE_KEY and/or CLERK_SECRET_KEY must be set.',
      );
      throw new Error(
        'Clerk environment variables missing: CLERK_PUBLISHABLE_KEY and/or CLERK_SECRET_KEY must be set.',
      );
    }

    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Authorization header missing or malformed.', authHeader);
      return false;
    }

    const token = authHeader.slice(7, authHeader.length).trim();
    if (!token) {
      console.warn('Bearer token missing in authorization header.');
      return false;
    }

    try {
      const { sid } = await this.clerkService.verifyToken(token);
      const { userId } = await this.clerkService.getSession(sid);
      const user = await this.userService.upsertUser(userId);
      request.user = user;
    } catch (err) {
      console.error('Error in ClerkAuthGuard:', err);
      return false;
    }

    return true;
  }
}
