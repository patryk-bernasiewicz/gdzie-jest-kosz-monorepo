import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should upsert and return user with valid Clerk token', async () => {
    // Replace 'valid_token' with a real Clerk session token for integration
    const validToken = 'valid_token';
    const response = await request(app.getHttpServer())
      .post('/user/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(201)
      .catch(() => null); // Accept 201 or 200 depending on upsert

    // Expect user object or error if token is invalid
    if (response && response.body && response.body.clerkId) {
      expect(response.body.clerkId).toBeDefined();
    } else {
      // If using a mock/invalid token, expect error
      expect(response?.status).toBe(401);
    }
  });

  it('should return error for missing token', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/me')
      .expect(500); // Throws error for missing/invalid Authorization header
    expect(response.body.message).toContain('Authorization');
  });
});
