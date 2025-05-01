process.env.CLERK_PUBLISHABLE_KEY = 'test-pub-key';
process.env.CLERK_SECRET_KEY = 'test-secret-key';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClerkService } from '../src/clerk/clerk.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClerkService)
      .useValue({
        verifyToken: jest.fn().mockResolvedValue({ sid: 'mock-session-id' }),
        getSession: jest.fn().mockResolvedValue({ userId: 'mock-user-id' }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should upsert and return user with valid Clerk token', async () => {
    const validToken = 'valid_token';
    const response = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.clerkId).toBeDefined();
  });

  it('should return 403 for missing token', async () => {
    await request(app.getHttpServer()).get('/user/me').expect(403);
  });
});
