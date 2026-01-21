import { AssignPermissionsUseCase } from '../../../../src/application/use-cases/commands/assign-permissions.use-case';
import { AssignPermissionsCommand } from '../../../../src/application/use-cases/commands/assign-permissions.command';
import { IRoleRepository } from '../../../../src/domain/interfaces/role-repository.interface';
import { IRolePermissionRepository } from '../../../../src/domain/interfaces/role-permission-repository.interface';
import { IEventBus } from '../../../../src/domain/interfaces/event-bus.interface';
import { Role } from '../../../../src/domain/entities/role.entity';
import { RoleNotFoundException } from '../../../../src/domain/exceptions/role-not-found.exception';

describe('AssignPermissionsUseCase', () => {
  let useCase: AssignPermissionsUseCase;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let rolePermissionRepository: jest.Mocked<IRolePermissionRepository>;
  let eventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    roleRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    rolePermissionRepository = {
      assignPermissions: jest.fn(),
      removePermissions: jest.fn(),
    };

    eventBus = {
      publish: jest.fn(),
    };

    useCase = new AssignPermissionsUseCase(roleRepository, rolePermissionRepository, eventBus);
  });

  it('should assign permissions successfully', async () => {
    const role = Role.create('role-123', 'ADMIN', 'Admin role', false);
    roleRepository.findById.mockResolvedValue(role);
    rolePermissionRepository.assignPermissions.mockResolvedValue(undefined);

    const permissionIds = ['perm-1', 'perm-2', 'perm-3'];
    const command = new AssignPermissionsCommand('role-123', permissionIds);

    await useCase.execute(command);

    expect(roleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(rolePermissionRepository.assignPermissions).toHaveBeenCalledWith('role-123', permissionIds);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: 'role-123',
        permissionIds,
      }),
    );
  });

  it('should throw RoleNotFoundException when role does not exist', async () => {
    roleRepository.findById.mockResolvedValue(null);

    const command = new AssignPermissionsCommand('non-existent', ['perm-1']);

    await expect(useCase.execute(command)).rejects.toThrow(RoleNotFoundException);
    expect(rolePermissionRepository.assignPermissions).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should handle empty permission list', async () => {
    const role = Role.create('role-456', 'USER', 'User role', false);
    roleRepository.findById.mockResolvedValue(role);

    const command = new AssignPermissionsCommand('role-456', []);

    await useCase.execute(command);

    expect(rolePermissionRepository.assignPermissions).toHaveBeenCalledWith('role-456', []);
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('should assign single permission', async () => {
    const role = Role.create('role-789', 'GUEST', 'Guest role', false);
    roleRepository.findById.mockResolvedValue(role);

    const command = new AssignPermissionsCommand('role-789', ['perm-single']);

    await useCase.execute(command);

    expect(rolePermissionRepository.assignPermissions).toHaveBeenCalledWith('role-789', ['perm-single']);
  });
});
