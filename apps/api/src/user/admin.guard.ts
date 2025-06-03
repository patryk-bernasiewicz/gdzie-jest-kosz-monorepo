import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { InsufficientPermissionsException } from '../common/exceptions/auth.exceptions';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user: User = request.user as User;

    if (!user) {
      this.logger.warn('Admin guard called without authenticated user');
      throw new InsufficientPermissionsException('admin');
    }

    if (user.role !== 'admin') {
      this.logger.warn(`User ${user.id} attempted admin access with role: ${user.role}`);
      throw new InsufficientPermissionsException('admin');
    }

    this.logger.debug(`Admin access granted to user: ${user.id}`);
    return true;
  }
}
