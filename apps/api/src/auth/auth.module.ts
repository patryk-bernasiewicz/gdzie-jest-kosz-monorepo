import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { ClerkModule } from '../clerk/clerk.module';

@Module({
  imports: [forwardRef(() => UserModule), ClerkModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
