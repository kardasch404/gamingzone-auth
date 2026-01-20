import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssignPermissionsUseCase } from '../../src/application/use-cases/assign-permissions.use-case';
import { IRoleRepository } from '../../src/domain/interfaces/role-repository.interface';
import { IPermissionRepository } from '../../src/domain/interfaces/permission-repository.interface';
import { AssignPermissionsDto } from '../../src/application/dto/assign-permissions.dto';

describe('AssignPermissionsUseCase', () => {
  let useCase: AssignPermissionsUseCase;

  const mockRoleRepository = {
    findById: jest.fn(),
    assignPermission: jest.fn(),
    create: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    removePermission: jest.fn(),
  };

  const mockPermissionRepository = {
    findById: jest.fn(),
    create: jest.fn(),
    findByResourceAndAction: jest.fn(),
    findAll: jest.fn(),
    findByResource: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AssignPermissionsUseCase,
          useFactory: (roleRepo: IRoleRepository, permRepo: IPermissionRepository) => 
            new AssignPermissionsUseCase(roleRepo, permRepo),
          inject: ['IRoleRepository', 'IPermissionRepository'],
        },
        { provide: 'IRoleRepository', useValue: mockRoleRepository },
        { provide: 'IPermissionRepository', useValue: mockPermissionRepository },
      ],
    }).compile();

    useCase = module.get<AssignPermissionsUseCase>(AssignPermissionsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should assign permissions to role successfully', async () => {
    const dto: AssignPermissionsDto = {
      roleId: 'role1',
      permissionIds: ['perm1', 'perm2'],
    };

    mockRoleRepository.findById.mockResolvedValue({ id: 'role1', name: 'admin' });
    mockPermissionRepository.findById.mockResolvedValue({ id: 'perm1' });

    await useCase.execute(dto);

    expect(mockRoleRepository.findById).toHaveBeenCalledWith(dto.roleId);
    expect(mockPermissionRepository.findById).toHaveBeenCalledTimes(2);
    expect(mockRoleRepository.assignPermission).toHaveBeenCalledTimes(2);
  });

  it('should throw NotFoundException if role not found', async () => {
    const dto: AssignPermissionsDto = {
      roleId: 'invalid',
      permissionIds: ['perm1'],
    };

    mockRoleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(mockRoleRepository.assignPermission).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if permission not found', async () => {
    const dto: AssignPermissionsDto = {
      roleId: 'role1',
      permissionIds: ['invalid'],
    };

    mockRoleRepository.findById.mockResolvedValue({ id: 'role1' });
    mockPermissionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });
});
