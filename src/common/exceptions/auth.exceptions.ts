import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTokenException extends HttpException {
  constructor(message?: string) {
    const errorCode = 'INVALID_TOKEN';
    const defaultMessage = 'Invalid or expired authentication token';
    super({
      message: message || defaultMessage,
      error: 'Authentication Failed',
      details: { errorCode }
    }, HttpStatus.UNAUTHORIZED);
  }
}

export class MissingTokenException extends HttpException {
  constructor(message?: string) {
    const errorCode = 'MISSING_TOKEN';
    const defaultMessage = 'Authentication token is required';
    super({
      message: message || defaultMessage,
      error: 'Authentication Required',
      details: { errorCode }
    }, HttpStatus.UNAUTHORIZED);
  }
}

export class InsufficientPermissionsException extends HttpException {
  constructor(requiredRole?: string) {
    const message = requiredRole
      ? `${requiredRole} role is required for this operation`
      : 'Insufficient permissions for this operation';
    const errorCode = 'INSUFFICIENT_PERMISSIONS';
    super({
      message,
      error: 'Authorization Failed',
      details: { errorCode }
    }, HttpStatus.FORBIDDEN);
  }
}

export class UserCreationException extends HttpException {
  constructor(clerkId: string, originalError?: string) {
    const errorCode = 'USER_CREATION_ERROR';
    super({
      message: 'Failed to create or update user account',
      error: 'User Management Error',
      details: { errorCode, clerkId, originalError }
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
} 