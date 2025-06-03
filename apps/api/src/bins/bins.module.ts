import { Module } from '@nestjs/common';
import { BinsService } from './bins.service';
import { BinsController } from './bins.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { ClerkModule } from '../clerk/clerk.module';

@Module({
  imports: [DatabaseModule, UserModule, ClerkModule],
  providers: [BinsService],
  controllers: [BinsController],
})
export class BinsModule {}
