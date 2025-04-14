import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('upsert')
  upsertUser(@Body('clerkId') clerkId: string): Promise<User> {
    return this.userService.upsertUser(clerkId);
  }

  @Get('me')
  getUser(@Query('clerkId') clerkId: string): Promise<User | null> {
    return this.userService.getByClerkId(clerkId);
  }
}
