import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '@core/prisma.service';
import { RedisService } from '@core/redis.service';
import { AppModule } from '../../../src/app.module';
import { Password } from '@domain/value-objects/password.vo';

describe('Rate Limiting Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    redis = app.get<RedisService>(RedisService);
  });

  beforeEach(async () => {
    const passwordHash = await Password.fromPlainText('Password123!');
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: passwordHash.getValue(),
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        emailVerified: true,
        roleId: 'default-role-id',
      },
    });

    await redis.deletePattern('rate-limit:login:*');
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.user.deleteMany();
    await redis.deletePattern('rate-limit:login:*');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should enforce rate limiting after 5 login attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(429);
  });

  it('should allow login after rate limit expires', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(429);

    await redis.deletePattern('rate-limit:login:*');

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(200);
  });
});
