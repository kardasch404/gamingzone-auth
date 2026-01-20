import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../src/infrastructure/database/user.repository';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    const user = { email: 'test@test.com', password: 'hash', firstname: 'John', lastname: 'Doe' };
    mockPrismaService.user.create.mockResolvedValue({ id: '1', ...user, createdAt: new Date(), updatedAt: new Date() });

    const result = await repository.create(user);
    expect(result.email).toBe(user.email);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data: user });
  });

  it('should find user by email', async () => {
    const user = { id: '1', email: 'test@test.com', password: 'hash', firstname: 'John', lastname: 'Doe', createdAt: new Date(), updatedAt: new Date() };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await repository.findByEmail('test@test.com');
    expect(result).toEqual(user);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
  });
});
