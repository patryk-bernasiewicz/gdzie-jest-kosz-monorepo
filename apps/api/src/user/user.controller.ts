import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { CurrentUser } from './current-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth()
@Controller({ path: 'user', version: '1' })
export class UserController {
  private readonly logger = new Logger(UserController.name);

  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User found' })
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  async authenticateAndUpsert(@CurrentUser() user: User): Promise<User> {
    this.logger.log('GET /user/me called');
    return user;
  }
}
