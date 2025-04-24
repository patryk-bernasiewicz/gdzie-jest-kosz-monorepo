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
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7, authHeader.length).trim();
    if (!token) {
      return false;
    }

    try {
      const { sid } = await this.clerkService.verifyToken(token);
      const { userId } = await this.clerkService.getSession(sid);
      const user = await this.userService.upsertUser(userId);
      request.user = user;
    } catch (err) {
      console.log('Error in ClerkAuthGuard:', err);
      return false;
    }

    return true;
  }
}
