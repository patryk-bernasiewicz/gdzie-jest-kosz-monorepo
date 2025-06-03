import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException, // Using standard NestJS exception
} from '@nestjs/common';
import { Request } from 'express'; // We need Request type from express
import { User } from '@prisma/client'; // Assuming request.user is of type User
import { InsufficientPermissionsException } from '../common/exceptions/auth.exceptions';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User; // Get user from request, populated by AuthGuard

    if (!user) {
      this.logger.warn('AdminGuard: No user object found on request. AuthGuard might not have run or failed.');
      throw new ForbiddenException('Access denied. User not authenticated.');
    }

    if (user.role !== 'admin') {
      this.logger.warn(`AdminGuard: User ${user.id} with role '${user.role}' attempted admin access.`);
      throw new InsufficientPermissionsException('admin'); // Custom exception
    }

    this.logger.debug(`AdminGuard: Admin access granted to user ${user.id}.`);
    return true;
  }
} 