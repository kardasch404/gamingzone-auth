import { RegisterUserUseCase } from '../../../src/application/use-cases/commands/register-user.use-case';
import { RegisterUserCommand } from '../../../src/application/use-cases/commands/register-user.command';
import { IUserRepository } from '../../../src/domain/interfaces/user-repository.interface';
import { IRoleRepository } from '../../../src/domain/interfaces/role-repository.interface';
import { IEventBus } from '../../../src/domain/interfaces/event-bus.interface';
import { UserAlreadyExistsException } from '../../../src/domain/exceptions/user-already-exists.exception';
import { User } from '../../../src/domain/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let eventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as any;

    roleRepository = {
      findByName: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    useCase = new RegisterUserUseCase(userRepository, roleRepository, eventBus);
  });

  it('should register a new user successfully', async () => {
    const command = new RegisterUserCommand(
      'test@example.com',
      'password123',
      'John',
      'Doe',
    );

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute(command);

    expect(result.email).toBe('test@example.com');
    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(userRepository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('should throw UserAlreadyExistsException if email exists', async () => {
    const command = new RegisterUserCommand('test@example.com', 'password123');
    const existingUser = User.create('1', 'test@example.com', 'hashedpass');

    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(command)).rejects.toThrow(
      UserAlreadyExistsException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const command = new RegisterUserCommand('invalid-email', 'password123');

    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow();
  });

  it('should validate password length', async () => {
    const command = new RegisterUserCommand('test@example.com', 'short');

    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow();
  });
});
