import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('GET / called');
    return this.appService.getHello();
  }

  @Get('health')
  healthcheck(): string {
    this.logger.log('GET /health called');
    return this.appService.getHealth();
  }
}
