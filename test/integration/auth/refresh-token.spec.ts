import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@core/prisma.service';
import { AppModule } from '@src/app.module';
import { Password } from '@domain/value-objects/password.vo';

describe('Refresh Token Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let tokens: { accessToken: string; refreshToken: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    const passwordHash = await Password.fromPlainText('Password123!');
    testUser = await prisma.user.create({
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

    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!',
    });

    tokens = {
      accessToken: loginResponse.body.accessToken,
      refreshToken: loginResponse.body.refreshToken,
    };
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should refresh access token with valid refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: tokens.refreshToken,
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('expiresIn', 900);
    expect(response.body.accessToken).not.toBe(tokens.accessToken);
  });

  it('should fail with invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: 'invalid-token',
      })
      .expect(401);
  });

  it('should fail with expired refresh token', async () => {
    await prisma.session.updateMany({
      where: { userId: testUser.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: tokens.refreshToken,
      })
      .expect(401);
  });
});
