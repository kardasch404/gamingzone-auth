import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from '../../src/infrastructure/database/role.repository';

describe('RoleRepository', () => {
  let repository: RoleRepository;

  const mockPrismaService = {
    role: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    rolePermission: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        { provide: 'PrismaService', useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<RoleRepository>(RoleRepository);
  });

  it('should create a role', async () => {
    const role = { name: 'admin', description: 'Admin role', isSystem: true };
    mockPrismaService.role.create.mockResolvedValue({ id: '1', ...role, createdAt: new Date(), updatedAt: new Date() });

    const result = await repository.create(role);
    expect(result.name).toBe(role.name);
    expect(mockPrismaService.role.create).toHaveBeenCalledWith({ data: role });
  });

  it('should find role by name', async () => {
    const role = { id: '1', name: 'admin', description: 'Admin', isSystem: true, createdAt: new Date(), updatedAt: new Date() };
    mockPrismaService.role.findUnique.mockResolvedValue(role);

    const result = await repository.findByName('admin');
    expect(result).toEqual(role);
  });

  it('should assign permission to role', async () => {
    mockPrismaService.rolePermission.create.mockResolvedValue({});

    await repository.assignPermission('role1', 'perm1');
    expect(mockPrismaService.rolePermission.create).toHaveBeenCalledWith({
      data: { roleId: 'role1', permissionId: 'perm1' },
    });
  });
});
