import { CreateRoleUseCase } from '../../../../src/application/use-cases/commands/create-role.use-case';
import { CreateRoleCommand } from '../../../../src/application/use-cases/commands/create-role.command';
import { IRoleRepository } from '../../../../src/domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../../src/domain/interfaces/event-bus.interface';
import { Role } from '../../../../src/domain/entities/role.entity';
import { RoleCreatedEvent } from '../../../../src/domain/events/role-created.event';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
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

    useCase = new CreateRoleUseCase(roleRepository, eventBus);
  });

  it('should create a role successfully', async () => {
    const command = new CreateRoleCommand('ADMIN', 'Admin role', false);
    const savedRole = Role.create('role-123', 'ADMIN', 'Admin role', false);
    roleRepository.save.mockResolvedValue(savedRole);

    const result = await useCase.execute(command);

    expect(roleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ADMIN',
        description: 'Admin role',
        isSystem: false,
      }),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: expect.any(String),
        name: 'ADMIN',
        isSystem: false,
      }),
    );
    expect(result.name).toBe('ADMIN');
  });

  it('should create a system role', async () => {
    const command = new CreateRoleCommand('SUPER_ADMIN', 'Super Admin', true);
    const savedRole = Role.create('role-456', 'SUPER_ADMIN', 'Super Admin', true);
    roleRepository.save.mockResolvedValue(savedRole);

    const result = await useCase.execute(command);

    expect(result.isSystem).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(RoleCreatedEvent),
    );
  });

  it('should create role without description', async () => {
    const command = new CreateRoleCommand('USER');
    const savedRole = Role.create('role-789', 'USER', undefined, false);
    roleRepository.save.mockResolvedValue(savedRole);

    const result = await useCase.execute(command);

    expect(result.description).toBeNull();
  });
});
