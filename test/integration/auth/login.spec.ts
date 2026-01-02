import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@core/prisma.service';
import { AppModule } from '@src/app.module';
import { Password } from '@domain/value-objects/password.vo';

describe('Login Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;

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
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('expiresIn', 900);
    expect(response.body.user).toHaveProperty('id', testUser.id);
    expect(response.body.user).toHaveProperty('email', 'test@example.com');

    const session = await prisma.session.findFirst({
      where: { userId: testUser.id },
    });
    expect(session).toBeDefined();
  });

  it('should fail with invalid password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword',
      })
      .expect(401);
  });

  it('should fail with non-existent email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      })
      .expect(401);
  });

  it('should track login in activity log', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(200);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const activityLog = await prisma.activityLog.findFirst({
      where: {
        userId: testUser.id,
        action: 'login',
      },
    });
    expect(activityLog).toBeDefined();
  });
});
