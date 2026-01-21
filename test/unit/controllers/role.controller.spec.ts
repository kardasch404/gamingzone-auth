import { RoleController } from '../../../src/presentation/rest/controllers/role.controller';
import { IRoleRepository } from '../../../src/domain/interfaces/role-repository.interface';
import { CreateRoleUseCase } from '../../../src/application/use-cases/commands/create-role.use-case';
import { UpdateRoleUseCase } from '../../../src/application/use-cases/commands/update-role.use-case';
import { DeleteRoleUseCase } from '../../../src/application/use-cases/commands/delete-role.use-case';
import { AssignPermissionsUseCase } from '../../../src/application/use-cases/commands/assign-permissions.use-case';
import { RemovePermissionsUseCase } from '../../../src/application/use-cases/commands/remove-permissions.use-case';
import { Role } from '../../../src/domain/entities/role.entity';

describe('RoleController', () => {
  let controller: RoleController;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let createRoleUseCase: jest.Mocked<CreateRoleUseCase>;
  let updateRoleUseCase: jest.Mocked<UpdateRoleUseCase>;
  let deleteRoleUseCase: jest.Mocked<DeleteRoleUseCase>;
  let assignPermissionsUseCase: jest.Mocked<AssignPermissionsUseCase>;
  let removePermissionsUseCase: jest.Mocked<RemovePermissionsUseCase>;

  beforeEach(() => {
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    createRoleUseCase = { execute: jest.fn() } as any;
    updateRoleUseCase = { execute: jest.fn() } as any;
    deleteRoleUseCase = { execute: jest.fn() } as any;
    assignPermissionsUseCase = { execute: jest.fn() } as any;
    removePermissionsUseCase = { execute: jest.fn() } as any;

    controller = new RoleController(
      roleRepository,
      createRoleUseCase,
      updateRoleUseCase,
      deleteRoleUseCase,
      assignPermissionsUseCase,
      removePermissionsUseCase,
    );
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [Role.create('role-1', 'ADMIN', 'Admin role')];
      roleRepository.findAll.mockResolvedValue(roles);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(roleRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const dto = { name: 'MODERATOR', description: 'Moderator role' };
      const result = { id: 'role-1', name: 'MODERATOR' } as any;
      createRoleUseCase.execute.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(createRoleUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('assignPermissions', () => {
    it('should assign permissions to role', async () => {
      const dto = { permissionIds: ['perm-1', 'perm-2'] };

      await controller.assignPermissions('role-1', dto);

      expect(assignPermissionsUseCase.execute).toHaveBeenCalled();
    });
  });
});
