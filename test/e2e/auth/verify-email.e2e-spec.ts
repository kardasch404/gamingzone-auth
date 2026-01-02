import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '@core/prisma.service';
import { RedisService } from '@core/redis.service';

describe('POST /api/v1/auth/verify-email (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    redis = app.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    const keys = await redis.keys('email-verification:*');
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.delete(key)));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should verify email successfully', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
      })
      .expect(201);

    const userId = registerResponse.body.id;
    const verificationCode = await redis.get(`email-verification:${userId}`);

    const verifyResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({
        userId,
        code: verificationCode,
      })
      .expect(200);

    expect(verifyResponse.body.message).toBe('Email verified successfully');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.emailVerified).toBe(true);
  });

  it('should return 400 for expired code', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const userId = registerResponse.body.id;
    await redis.delete(`email-verification:${userId}`);

    return request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({
        userId,
        code: '123456',
      })
      .expect(400);
  });

  it('should return 400 for invalid code', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const userId = registerResponse.body.id;

    return request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({
        userId,
        code: '999999',
      })
      .expect(400);
  });

  it('should return 404 for non-existent user', async () => {
    await redis.set('email-verification:fake-id', '123456', 300);

    return request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({
        userId: 'fake-id',
        code: '123456',
      })
      .expect(404);
  });

  it('should return 400 for invalid userId format', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({
        userId: 'not-a-uuid',
        code: '123456',
      })
      .expect(400);
  });

  it('should return 400 for invalid code length', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    return request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({
        userId: registerResponse.body.id,
        code: '123',
      })
      .expect(400);
  });

  it('should delete verification code after successful verification', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const userId = registerResponse.body.id;
    const verificationCode = await redis.get(`email-verification:${userId}`);

    await request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({
        userId,
        code: verificationCode,
      })
      .expect(200);

    const codeAfterVerification = await redis.get(`email-verification:${userId}`);
    expect(codeAfterVerification).toBeNull();
  });
});
