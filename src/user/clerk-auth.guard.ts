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
import { 
  InvalidTokenException, 
  MissingTokenException 
} from '../common/exceptions/auth.exceptions';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly userService: UserService,
    private readonly clerkService: ClerkService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
      const error = 'Clerk environment variables missing: CLERK_PUBLISHABLE_KEY and/or CLERK_SECRET_KEY must be set.';
      this.logger.error(error);
      throw new Error(error);
    }

    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.debug('Authorization header missing or malformed', { authHeader });
      throw new MissingTokenException();
    }

    const token = authHeader.slice(7, authHeader.length).trim();
    if (!token) {
      this.logger.debug('Bearer token missing in authorization header');
      throw new MissingTokenException();
    }

    try {
      const { sid } = await this.clerkService.verifyToken(token);
      const { userId } = await this.clerkService.getSession(sid);
      const user = await this.userService.upsertUser(userId);
      request.user = user;
      
      this.logger.debug(`Successfully authenticated user: ${user.id}`);
      return true;
    } catch (err) {
      this.logger.warn('Authentication failed', { error: err instanceof Error ? err.message : 'Unknown error' });
      throw new InvalidTokenException();
    }
  }
}
