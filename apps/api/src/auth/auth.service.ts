import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ClerkService } from '../clerk/clerk.service';
import { User } from '@prisma/client';
import {
  InvalidTokenException,
  UserCreationException,
} from '../common/exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly clerkService: ClerkService,
  ) {}

  async validateUser(token: string): Promise<User | null> {
    this.logger.debug(
      `Validating token... (first 10 chars: ${token ? token.substring(0, 10) : 'N/A'})`,
    );
    if (!token) {
      this.logger.warn('validateUser called with no token.');
      throw new InvalidTokenException('Token cannot be empty.');
    }

    try {
      // Step 1: Verify token with Clerk and get session ID (sid)
      const verifiedTokenPayload = await this.clerkService.verifyToken(token);
      if (!verifiedTokenPayload || !verifiedTokenPayload.sid) {
        this.logger.warn(
          'Clerk token verification failed or SID missing from payload.',
        );
        throw new InvalidTokenException(
          'Invalid token or session ID missing from Clerk payload.',
        );
      }
      this.logger.debug(
        `Clerk token verified, session ID: ${verifiedTokenPayload.sid}`,
      );

      // Step 2: Get session details from Clerk using sid to get Clerk userId
      const clerkSession = await this.clerkService.getSession(
        verifiedTokenPayload.sid,
      );
      if (!clerkSession || !clerkSession.userId) {
        this.logger.warn(
          'Clerk session not found or userId missing from Clerk session details.',
        );
        throw new InvalidTokenException(
          'Clerk session invalid or user ID missing.',
        );
      }
      const clerkUserId = clerkSession.userId;
      this.logger.debug(`Clerk session fetched, Clerk User ID: ${clerkUserId}`);

      // Step 3: Upsert user in local DB based on Clerk User ID
      const dbUser: User = await this.userService.upsertUser(clerkUserId);
      if (!dbUser) {
        this.logger.error(
          `userService.upsertUser returned null/undefined for Clerk ID: ${clerkUserId}. This should not happen.`,
        );
        throw new Error(
          'User synchronization failed after successful authentication.',
        );
      }
      this.logger.debug(
        `User successfully upserted/retrieved from DB: ID ${dbUser.id}, ClerkID ${dbUser.clerkId}`,
      );

      // Step 4: Return the local user object
      return dbUser;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.warn(`Authentication error in validateUser: ${message}`, {
        stack,
      });
      if (
        error instanceof InvalidTokenException ||
        error instanceof UserCreationException
      ) {
        throw error;
      }
      throw new InvalidTokenException(
        `Authentication failed due to an underlying error: ${message}`,
      );
    }
  }

  getAuthenticatedUser(_token: string): Promise<User | null> {
    return Promise.resolve(null);
  }

  hasPermission(_token: string, _permission: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}
