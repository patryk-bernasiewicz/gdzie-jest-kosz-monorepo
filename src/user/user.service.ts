import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  async upsertUser(clerkId: string): Promise<User> {
    const user = await this.db.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId },
    });
    return user;
  }

  async getByClerkId(clerkId: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { clerkId },
    });
    return user;
  }
}
