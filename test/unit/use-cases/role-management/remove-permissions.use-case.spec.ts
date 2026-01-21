import { RemovePermissionsUseCase } from '../../../../src/application/use-cases/commands/remove-permissions.use-case';
import { RemovePermissionsCommand } from '../../../../src/application/use-cases/commands/remove-permissions.command';
import { IRoleRepository } from '../../../../src/domain/interfaces/role-repository.interface';
import { IRolePermissionRepository } from '../../../../src/domain/interfaces/role-permission-repository.interface';
import { IEventBus } from '../../../../src/domain/interfaces/event-bus.interface';
import { Role } from '../../../../src/domain/entities/role.entity';
import { RoleNotFoundException } from '../../../../src/domain/exceptions/role-not-found.exception';

describe('RemovePermissionsUseCase', () => {
  let useCase: RemovePermissionsUseCase;
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

    useCase = new RemovePermissionsUseCase(roleRepository, rolePermissionRepository, eventBus);
  });

  it('should remove permissions successfully', async () => {
    const role = Role.create('role-123', 'ADMIN', 'Admin role', false);
    roleRepository.findById.mockResolvedValue(role);
    rolePermissionRepository.removePermissions.mockResolvedValue(undefined);

    const permissionIds = ['perm-1', 'perm-2'];
    const command = new RemovePermissionsCommand('role-123', permissionIds);

    await useCase.execute(command);

    expect(roleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(rolePermissionRepository.removePermissions).toHaveBeenCalledWith('role-123', permissionIds);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: 'role-123',
        permissionIds,
      }),
    );
  });

  it('should throw RoleNotFoundException when role does not exist', async () => {
    roleRepository.findById.mockResolvedValue(null);

    const command = new RemovePermissionsCommand('non-existent', ['perm-1']);

    await expect(useCase.execute(command)).rejects.toThrow(RoleNotFoundException);
    expect(rolePermissionRepository.removePermissions).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should handle empty permission list', async () => {
    const role = Role.create('role-456', 'USER', 'User role', false);
    roleRepository.findById.mockResolvedValue(role);

    const command = new RemovePermissionsCommand('role-456', []);

    await useCase.execute(command);

    expect(rolePermissionRepository.removePermissions).toHaveBeenCalledWith('role-456', []);
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('should remove single permission', async () => {
    const role = Role.create('role-789', 'GUEST', 'Guest role', false);
    roleRepository.findById.mockResolvedValue(role);

    const command = new RemovePermissionsCommand('role-789', ['perm-single']);

    await useCase.execute(command);

    expect(rolePermissionRepository.removePermissions).toHaveBeenCalledWith('role-789', ['perm-single']);
  });

  it('should work with system roles', async () => {
    const systemRole = Role.create('role-sys', 'SYSTEM', 'System role', true);
    roleRepository.findById.mockResolvedValue(systemRole);

    const command = new RemovePermissionsCommand('role-sys', ['perm-1']);

    await useCase.execute(command);

    expect(rolePermissionRepository.removePermissions).toHaveBeenCalled();
  });
});
