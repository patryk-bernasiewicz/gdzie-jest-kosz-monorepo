import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
  details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ method: string; url: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let details: unknown = undefined;
    const isDev = process.env.NODE_ENV === 'development';

    // Handle HTTP exceptions (NestJS built-in exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        // Default to a title-cased version of the HttpStatus key or exception.name
        const statusKey = Object.keys(HttpStatus).find((key) => {
          const statusValue = HttpStatus[key as keyof typeof HttpStatus];
          return typeof statusValue === 'number' && statusValue === status;
        });
        if (statusKey) {
          error = statusKey
            .split('_')
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(' ');
        } else {
          error = exception.name;
        }
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const typedResponse = exceptionResponse as Record<string, unknown>; // Cast for type safety
        message =
          typeof typedResponse.message === 'string' ||
          Array.isArray(typedResponse.message)
            ? typedResponse.message
            : JSON.stringify(exceptionResponse); // Fallback for non-standard objects
        error =
          typeof typedResponse.error === 'string'
            ? typedResponse.error
            : exception.name;
        if (isDev && typedResponse.details) {
          details = typedResponse.details;
        }
      }
    }
    // Handle Prisma database errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.getPrismaErrorStatus(exception.code);
      message = this.getPrismaErrorMessage(exception);
      error = 'Database Error';
      if (isDev) {
        details = exception.meta;
      }
    }
    // Handle Prisma validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      error = 'Validation Error';
      if (isDev) {
        details = exception.message;
      }
    }
    // Handle unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      if (isDev) {
        details = exception.stack;
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
      ...(isDev && details ? { details } : {}),
    };

    // Log the error
    const messageStr = Array.isArray(message) ? message.join(', ') : message;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${messageStr}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${messageStr}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getPrismaErrorStatus(code: string): number {
    switch (code) {
      case 'P2002': // Unique constraint violation
        return HttpStatus.CONFLICT;
      case 'P2025': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2003': // Foreign key constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2004': // Constraint violation
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaErrorMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (exception.code) {
      case 'P2002':
        return `A record with this ${String(exception.meta?.target)} already exists`;
      case 'P2025':
        return 'The requested record was not found';
      case 'P2003':
        return 'Invalid reference to related record';
      case 'P2004':
        return 'A database constraint was violated';
      default:
        return 'A database error occurred';
    }
  }
}
