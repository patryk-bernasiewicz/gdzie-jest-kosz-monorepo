import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { UserService } from './user.service';
import { ClerkModule } from '../clerk/clerk.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, ClerkModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
