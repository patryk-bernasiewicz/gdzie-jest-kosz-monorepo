import {
  GlobalExceptionFilter,
  ErrorResponse,
} from './global-exception.filter';
import {
  HttpException,
  HttpStatus,
  Logger,
  ArgumentsHost,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Suppress logger output for tests
Logger.overrideLogger(false);

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockGetResponse: jest.Mock;
  let mockGetRequest: jest.Mock;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    mockGetRequest = jest.fn().mockReturnValue({ url: '/test', method: 'GET' });

    // Simplified mock for ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;

    // Reset NODE_ENV for consistent testing of 'details' field
    delete process.env.NODE_ENV;
  });

  const expectErrorResponse = (
    expectedStatus: HttpStatus,
    expectedMessage: string | string[],
    expectedError?: string,
  ) => {
    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: expectedStatus,
        message: expectedMessage,
        path: '/test',
        error: expectedError || expect.any(String), // Allow default error string if not specified
        timestamp: expect.any(String),
      }),
    );
  };

  it('should handle HttpException correctly', () => {
    const exception = new HttpException(
      'Test HttpException',
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Test HttpException',
      'Bad Request',
    );
  });

  it('should handle HttpException with object response correctly', () => {
    const exception = new HttpException(
      { message: 'Object message', error: 'Custom Error' },
      HttpStatus.UNAUTHORIZED,
    );
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Object message',
      'Custom Error',
    );
  });

  it('should handle PrismaClientKnownRequestError (P2002 - Unique Constraint)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: 'test', meta: { target: 'email' } },
    );
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.CONFLICT,
      'A record with this email already exists',
      'Database Error',
    );
  });

  it('should handle PrismaClientKnownRequestError (P2025 - Record Not Found)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Record not found',
      { code: 'P2025', clientVersion: 'test' },
    );
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.NOT_FOUND,
      'The requested record was not found',
      'Database Error',
    );
  });

  it('should handle PrismaClientKnownRequestError (P2003 - Foreign Key Constraint)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed',
      { code: 'P2003', clientVersion: 'test' },
    );
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Invalid reference to related record',
      'Database Error',
    );
  });

  it('should handle PrismaClientKnownRequestError (Unknown Code)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Some other Prisma error',
      { code: 'P9999', clientVersion: 'test' },
    );
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'A database error occurred',
      'Database Error',
    );
  });

  it('should handle PrismaClientValidationError', () => {
    const exception = new Prisma.PrismaClientValidationError(
      'Validation failed',
      { clientVersion: 'test' },
    );
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Invalid data provided',
      'Validation Error',
    );
  });

  it('should handle generic Error', () => {
    const exception = new Error('Generic error message');
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Generic error message',
      'Error',
    );
  });

  it('should handle unknown exception type (string)', () => {
    const exception = 'Just a string error';
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      'Internal Server Error',
    );
  });

  it('should handle unknown exception type (object)', () => {
    const exception = { someError: 'object error' };
    filter.catch(exception, mockArgumentsHost);
    expectErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      'Internal Server Error',
    );
  });

  describe('Development Mode Details', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
    });

    it('should include details for HttpException in dev mode', () => {
      const exception = new HttpException(
        { message: 'Dev error', details: { info: 'dev info' } },
        HttpStatus.BAD_GATEWAY,
      );
      filter.catch(exception, mockArgumentsHost);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ details: { info: 'dev info' } }),
      );
    });

    it('should include meta for PrismaClientKnownRequestError in dev mode', () => {
      const meta = { target: 'test_field' };
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Prisma dev error',
        { code: 'P2002', clientVersion: 'test', meta },
      );
      filter.catch(exception, mockArgumentsHost);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ details: meta }),
      );
    });

    it('should include message for PrismaClientValidationError in dev mode', () => {
      const exception = new Prisma.PrismaClientValidationError(
        'Prisma validation dev error',
        { clientVersion: 'test' },
      );
      filter.catch(exception, mockArgumentsHost);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ details: 'Prisma validation dev error' }),
      );
    });

    it('should include stack for generic Error in dev mode', () => {
      const exception = new Error('Generic dev error');
      exception.stack = 'Test stack trace';
      filter.catch(exception, mockArgumentsHost);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ details: 'Test stack trace' }),
      );
    });

    it('should not include details if not present even in dev mode (HttpException)', () => {
      const exception = new HttpException(
        'No details here',
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exception, mockArgumentsHost);
      const response = mockJson.mock.calls[0][0] as ErrorResponse;
      expect(response.details).toBeUndefined();
    });
  });
});
