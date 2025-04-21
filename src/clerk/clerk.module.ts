import { Module } from '@nestjs/common';
import { ClerkClientProvider } from './clerk-client.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ClerkClientProvider],
  exports: [],
})
export class ClerkModule {}
