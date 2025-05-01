process.env.CLERK_PUBLISHABLE_KEY = 'test-pub-key';
process.env.CLERK_SECRET_KEY = 'test-secret-key';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { ClerkService } from '../src/clerk/clerk.service';

class MockDatabaseService {
  bin = {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        lat: 50.0,
        lng: 20.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
    create: jest.fn().mockImplementation(({ data }) =>
      Promise.resolve({
        ...data,
        id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
  };
}

class MockClerkService {
  verifyToken = jest
    .fn()
    .mockResolvedValue({ id: 'test-user', email: 'test@example.com' });
}

describe('Bins E2E (mocked DB & Clerk)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(new MockDatabaseService())
      .overrideProvider(ClerkService)
      .useValue(new MockClerkService())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /bins returns bins from mock DB', async () => {
    const res = await request(app.getHttpServer())
      .get('/bins')
      .query({ latitude: 50.0, longitude: 20.0 })
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('lat');
    expect(res.body[0]).toHaveProperty('lng');
  });
});
