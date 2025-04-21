import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  async authenticateAndUpsert(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
