import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '@core/prisma.service';
import { AppModule } from '../../../src/app.module';
import { Password } from '@domain/value-objects/password.vo';

describe('Logout Integration Tests', () => {
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

  it('should logout from single device', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        allDevices: false,
      })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Logged out successfully');

    const sessions = await prisma.session.findMany({
      where: { userId: testUser.id },
    });
    expect(sessions).toHaveLength(0);
  });

  it('should logout from all devices', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!',
    });

    await request(app.getHttpServer()).post('/auth/login').send({
      email: 'test@example.com',
      password: 'Password123!',
    });

    let sessions = await prisma.session.findMany({
      where: { userId: testUser.id },
    });
    expect(sessions.length).toBeGreaterThan(1);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        allDevices: true,
      })
      .expect(200);

    sessions = await prisma.session.findMany({
      where: { userId: testUser.id },
    });
    expect(sessions).toHaveLength(0);
  });

  it('should track logout in activity log', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .send({
        allDevices: false,
      })
      .expect(200);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const activityLog = await prisma.activityLog.findFirst({
      where: {
        userId: testUser.id,
        action: 'logout',
      },
    });
    expect(activityLog).toBeDefined();
  });

  it('should fail logout without authentication', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({
        allDevices: false,
      })
      .expect(401);
  });
});
