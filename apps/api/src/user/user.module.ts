import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { UserService } from './user.service';
import { ClerkModule } from '../clerk/clerk.module';

@Module({
  imports: [DatabaseModule, ClerkModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
