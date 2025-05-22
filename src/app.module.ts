import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BinsModule } from './bins/bins.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ClerkModule } from './clerk/clerk.module';
import { getConfigOptions } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot(getConfigOptions()),
    DatabaseModule,
    BinsModule,
    UserModule,
    ClerkModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
