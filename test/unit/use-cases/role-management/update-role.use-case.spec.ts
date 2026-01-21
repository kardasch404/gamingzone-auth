import { UpdateRoleUseCase } from '../../../../src/application/use-cases/commands/update-role.use-case';
import { UpdateRoleCommand } from '../../../../src/application/use-cases/commands/update-role.command';
import { IRoleRepository } from '../../../../src/domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../../src/domain/interfaces/event-bus.interface';
import { Role } from '../../../../src/domain/entities/role.entity';
import { RoleNotFoundException } from '../../../../src/domain/exceptions/role-not-found.exception';
import { SystemRoleException } from '../../../../src/domain/exceptions/system-role.exception';

describe('UpdateRoleUseCase', () => {
  let useCase: UpdateRoleUseCase;
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

    useCase = new UpdateRoleUseCase(roleRepository, eventBus);
  });

  it('should update role successfully', async () => {
    const role = Role.create('role-123', 'ADMIN', 'Old description', false);
    roleRepository.findById.mockResolvedValue(role);
    roleRepository.update.mockResolvedValue(role);

    const command = new UpdateRoleCommand('role-123', 'SUPER_ADMIN', 'New description');
    const result = await useCase.execute(command);

    expect(roleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(roleRepository.update).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: 'role-123',
        changes: { name: 'SUPER_ADMIN', description: 'New description' },
      }),
    );
    expect(result.name).toBe('SUPER_ADMIN');
  });

  it('should throw RoleNotFoundException when role does not exist', async () => {
    roleRepository.findById.mockResolvedValue(null);

    const command = new UpdateRoleCommand('non-existent', 'NEW_NAME');

    await expect(useCase.execute(command)).rejects.toThrow(RoleNotFoundException);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should throw SystemRoleException when trying to update system role', async () => {
    const systemRole = Role.create('role-456', 'SYSTEM', 'System role', true);
    roleRepository.findById.mockResolvedValue(systemRole);

    const command = new UpdateRoleCommand('role-456', 'NEW_NAME');

    await expect(useCase.execute(command)).rejects.toThrow(SystemRoleException);
    expect(roleRepository.update).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should update only name', async () => {
    const role = Role.create('role-789', 'USER', 'User role', false);
    roleRepository.findById.mockResolvedValue(role);
    roleRepository.update.mockResolvedValue(role);

    const command = new UpdateRoleCommand('role-789', 'CUSTOMER');
    await useCase.execute(command);

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: { name: 'CUSTOMER' },
      }),
    );
  });

  it('should update only description', async () => {
    const role = Role.create('role-101', 'GUEST', 'Old desc', false);
    roleRepository.findById.mockResolvedValue(role);
    roleRepository.update.mockResolvedValue(role);

    const command = new UpdateRoleCommand('role-101', undefined, 'New desc');
    await useCase.execute(command);

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: { description: 'New desc' },
      }),
    );
  });
});
