import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import clerkClient from '@clerk/clerk-sdk-node';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

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
      const { sid } = await clerkClient.verifyToken(token);
      this.logger.debug(`Token verified, SID: ${sid}`);
      const { userId } = await clerkClient.sessions.getSession(sid);
      this.logger.debug(`Session retrieved, User ID: ${userId}`);
      const user = await this.userService.upsertUser(userId);
      this.logger.debug(`User upserted, User ID: ${user.id}`);
      request.user = user;
    } catch (err) {
      return false;
    }

    return true;
  }
}
