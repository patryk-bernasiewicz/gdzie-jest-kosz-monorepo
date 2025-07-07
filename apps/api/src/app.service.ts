import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private db: DatabaseService) {}

  getHello(): string {
    this.logger.log('getHello called');
    return 'Hello World!';
  }

  async getHealth(): Promise<string> {
    this.logger.log('getHealth called');

    try {
      await this.db.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error('Database connection failed', error);
      return 'Database connection failed';
    }

    return 'OK';
  }
}
