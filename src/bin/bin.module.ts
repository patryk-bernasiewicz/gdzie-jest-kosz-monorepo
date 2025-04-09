import { Module } from '@nestjs/common';
import { BinService } from './bin.service';
import { BinController } from './bin.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [BinService],
  controllers: [BinController],
})
export class BinModule {}
