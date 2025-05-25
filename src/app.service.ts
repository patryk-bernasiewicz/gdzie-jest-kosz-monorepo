import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.log('getHello called');
    return 'Hello World!';
  }

  getHealth(): string {
    this.logger.log('getHealth called');
    return 'OK';
  }
}
