import { Module } from '@nestjs/common';
import { ClerkClientProvider } from './clerk-client.provider';
import { ConfigModule } from '@nestjs/config';
import { ClerkService } from './clerk.service';

@Module({
  imports: [ConfigModule],
  providers: [ClerkClientProvider, ClerkService],
  exports: [ClerkService],
})
export class ClerkModule {}
