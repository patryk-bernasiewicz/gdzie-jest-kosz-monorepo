import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UserCreationException } from '../common/exceptions/auth.exceptions';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private db: DatabaseService) {}

  async upsertUser(clerkId: string): Promise<User> {
    this.logger.debug(`Upserting user with clerkId: ${clerkId}`);

    try {
      const user = await this.db.user.upsert({
        where: { clerkId },
        update: {},
        create: { clerkId },
      });

      this.logger.debug(`Successfully upserted user: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to upsert user with clerkId: ${clerkId}`,
        error,
      );
      throw new UserCreationException(
        clerkId,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    this.logger.log(`getUserById called with userId: ${userId}`);
    try {
      return await this.db.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${userId}`, error);
      throw error; // Let the global filter handle Prisma errors
    }
  }
}
