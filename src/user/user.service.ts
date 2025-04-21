import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  logger = new Logger(UserService.name);

  async upsertUser(clerkId: string): Promise<User> {
    this.logger.debug(`Upserting user with clerkId: ${clerkId}`);

    try {
      const user = await this.db.user.upsert({
        where: { clerkId },
        update: {},
        create: { clerkId },
      });
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw new Error('Failed to upsert user');
    }
  }
}
