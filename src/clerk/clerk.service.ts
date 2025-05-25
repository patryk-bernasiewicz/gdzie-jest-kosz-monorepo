import { Injectable, Logger } from '@nestjs/common';
import clerkClient from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);

  async verifyToken(token: string): Promise<{ sid: string }> {
    this.logger.log('Verifying Clerk token');
    try {
      const result = await clerkClient.verifyToken(token);
      this.logger.log('Clerk token verified successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to verify Clerk token', error);
      throw error;
    }
  }

  async getSession(sid: string): Promise<{ userId: string }> {
    this.logger.log(`Retrieving Clerk session for sid=${sid}`);
    try {
      const result = await clerkClient.sessions.getSession(sid);
      this.logger.log('Clerk session retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve Clerk session', error);
      throw error;
    }
  }
}
