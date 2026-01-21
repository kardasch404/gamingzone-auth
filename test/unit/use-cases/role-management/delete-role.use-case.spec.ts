import { DeleteRoleUseCase } from '../../../../src/application/use-cases/commands/delete-role.use-case';
import { DeleteRoleCommand } from '../../../../src/application/use-cases/commands/delete-role.command';
import { IRoleRepository } from '../../../../src/domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../../src/domain/interfaces/event-bus.interface';
import { Role } from '../../../../src/domain/entities/role.entity';
import { RoleNotFoundException } from '../../../../src/domain/exceptions/role-not-found.exception';
import { SystemRoleException } from '../../../../src/domain/exceptions/system-role.exception';

describe('DeleteRoleUseCase', () => {
  let useCase: DeleteRoleUseCase;
  let roleRepository: jest.Mocked<IRoleRepository>;
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

    eventBus = {
      publish: jest.fn(),
    };

    useCase = new DeleteRoleUseCase(roleRepository, eventBus);
  });

  it('should delete role successfully', async () => {
    const role = Role.create('role-123', 'CUSTOM_ROLE', 'Custom role', false);
    roleRepository.findById.mockResolvedValue(role);
    roleRepository.delete.mockResolvedValue(undefined);

    const command = new DeleteRoleCommand('role-123');
    await useCase.execute(command);

    expect(roleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(roleRepository.delete).toHaveBeenCalledWith('role-123');
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: 'role-123',
        name: 'CUSTOM_ROLE',
      }),
    );
  });

  it('should throw RoleNotFoundException when role does not exist', async () => {
    roleRepository.findById.mockResolvedValue(null);

    const command = new DeleteRoleCommand('non-existent');

    await expect(useCase.execute(command)).rejects.toThrow(RoleNotFoundException);
    expect(roleRepository.delete).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should throw SystemRoleException when trying to delete system role', async () => {
    const systemRole = Role.create('role-456', 'ADMIN', 'System admin', true);
    roleRepository.findById.mockResolvedValue(systemRole);

    const command = new DeleteRoleCommand('role-456');

    await expect(useCase.execute(command)).rejects.toThrow(SystemRoleException);
    expect(roleRepository.delete).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should use canDelete method to validate deletion', async () => {
    const role = Role.create('role-789', 'USER', 'User role', false);
    const canDeleteSpy = jest.spyOn(role, 'canDelete');
    roleRepository.findById.mockResolvedValue(role);

    const command = new DeleteRoleCommand('role-789');
    await useCase.execute(command);

    expect(canDeleteSpy).toHaveBeenCalled();
  });
});
