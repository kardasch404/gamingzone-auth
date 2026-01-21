import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../src/infrastructure/database/repositories/user.repository';
import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';
import { RedisService } from '../../../src/infrastructure/cache/redis/redis.service';
import { User } from '../../../src/domain/entities/user.entity';

describe('UserRepository Integration', () => {
  let repository: UserRepository;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, PrismaService, RedisService],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    await redis.clear();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should cache user after first fetch', async () => {
    const user = User.create('1', 'test@example.com', 'hashedpass');
    
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    await repository.findById('1');
    const cached = await repository.findById('1');

    expect(cached).toBeDefined();
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });
});
