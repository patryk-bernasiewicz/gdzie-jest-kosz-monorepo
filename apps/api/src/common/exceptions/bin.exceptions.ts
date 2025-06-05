import { HttpException, HttpStatus } from '@nestjs/common';

export class BinNotFoundException extends HttpException {
  constructor(binId?: number) {
    const message = binId ? `Bin with ID ${binId} not found` : 'Bin not found';
    const errorCode = 'BIN_NOT_FOUND';
    super(
      {
        message,
        error: 'Bin Not Found',
        details: { errorCode },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InvalidLocationException extends HttpException {
  constructor(latitude?: number, longitude?: number) {
    const message = 'Invalid location coordinates provided';
    const errorCode = 'INVALID_LOCATION';
    super(
      {
        message,
        error: 'Invalid Location',
        details: { errorCode, latitude, longitude },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class BinAlreadyExistsException extends HttpException {
  constructor(latitude: number, longitude: number) {
    const errorCode = 'DUPLICATE_LOCATION';
    super(
      {
        message: 'A bin already exists at this location',
        error: 'Duplicate Location',
        details: { errorCode, latitude, longitude },
      },
      HttpStatus.CONFLICT,
    );
  }
}
