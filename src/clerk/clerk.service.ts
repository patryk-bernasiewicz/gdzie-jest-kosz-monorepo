import { Injectable } from '@nestjs/common';
import clerkClient from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {
  async verifyToken(token: string): Promise<{ sid: string }> {
    // Wrap Clerk SDK verifyToken
    return clerkClient.verifyToken(token);
  }

  async getSession(sid: string): Promise<{ userId: string }> {
    // Wrap Clerk SDK session retrieval
    return clerkClient.sessions.getSession(sid);
  }
}
