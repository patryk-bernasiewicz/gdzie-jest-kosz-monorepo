import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;
    console.log('AdminGuard user:', user); // Log the user object for debugging
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Admin access required.');
    }
    return true;
  }
}
