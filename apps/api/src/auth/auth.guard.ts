import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';
import { Request } from 'express';
import {
  InvalidTokenException,
  MissingTokenException,
} from '../common/exceptions/auth.exceptions';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.debug('Authorization header missing or not Bearer type');
      throw new MissingTokenException();
    }

    const token = authHeader.slice(7, authHeader.length).trim();
    if (!token) {
      this.logger.debug('Bearer token is missing after Bearer prefix');
      throw new MissingTokenException();
    }

    try {
      this.logger.debug(
        `Attempting to validate token in AuthGuard: ${token.substring(0, 10)}...`,
      );
      const user = await this.authService.validateUser(token);

      if (user) {
        request.user = user;
        this.logger.debug(`User ${user.id} authenticated successfully.`);
        return true;
      } else {
        this.logger.warn('validateUser returned null, access denied.');
        throw new InvalidTokenException('Token validation failed.');
      }
    } catch (error) {
      this.logger.warn(`AuthGuard: Authentication failed - ${error.message}`);
      if (
        error instanceof MissingTokenException ||
        error instanceof InvalidTokenException
      ) {
        throw error;
      }
      throw new InvalidTokenException(
        error.message || 'Authentication failed due to an unexpected error.',
      );
    }
  }
}
