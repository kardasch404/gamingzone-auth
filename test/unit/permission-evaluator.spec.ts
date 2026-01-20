import { Test, TestingModule } from '@nestjs/testing';
import { PermissionEvaluator } from '../../src/infrastructure/external/permission-evaluator.service';

describe('PermissionEvaluator', () => {
  let evaluator: PermissionEvaluator;

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PermissionEvaluator,
          useFactory: (userRepo: any, prisma: any) => 
            new PermissionEvaluator(userRepo, prisma),
          inject: ['IUserRepository', 'PrismaService'],
        },
        { provide: 'IUserRepository', useValue: mockUserRepository },
        { provide: 'PrismaService', useValue: mockPrismaService },
      ],
    }).compile();

    evaluator = module.get<PermissionEvaluator>(PermissionEvaluator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if user not found', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const result = await evaluator.hasPermission('user1', 'orders', 'read');
    expect(result).toBe(false);
  });

  it('should return true if user has permission without conditions', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'user1',
      roles: [
        {
          role: {
            permissions: [
              {
                permission: {
                  resource: 'orders',
                  action: 'read',
                  conditions: null,
                },
              },
            ],
          },
        },
      ],
    });

    const result = await evaluator.hasPermission('user1', 'orders', 'read');
    expect(result).toBe(true);
  });

  it('should return true if user has permission with matching conditions', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'user1',
      roles: [
        {
          role: {
            permissions: [
              {
                permission: {
                  resource: 'orders',
                  action: 'update',
                  conditions: { ownerId: 'user1' },
                },
              },
            ],
          },
        },
      ],
    });

    const result = await evaluator.hasPermission('user1', 'orders', 'update', { ownerId: 'user1' });
    expect(result).toBe(true);
  });

  it('should return false if conditions do not match', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'user1',
      roles: [
        {
          role: {
            permissions: [
              {
                permission: {
                  resource: 'orders',
                  action: 'update',
                  conditions: { ownerId: 'user1' },
                },
              },
            ],
          },
        },
      ],
    });

    const result = await evaluator.hasPermission('user1', 'orders', 'update', { ownerId: 'user2' });
    expect(result).toBe(false);
  });

  it('should return false if user has no matching permission', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'user1',
      roles: [
        {
          role: {
            permissions: [
              {
                permission: {
                  resource: 'products',
                  action: 'read',
                  conditions: null,
                },
              },
            ],
          },
        },
      ],
    });

    const result = await evaluator.hasPermission('user1', 'orders', 'read');
    expect(result).toBe(false);
  });
});
