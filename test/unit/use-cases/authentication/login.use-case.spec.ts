import { LoginUseCase } from '../../../../src/application/use-cases/commands/login.use-case';
import { LoginCommand } from '../../../../src/application/use-cases/commands/login.command';
import { IUserRepository } from '../../../../src/domain/interfaces/user-repository.interface';
import { IPermissionRepository } from '../../../../src/domain/interfaces/permission-repository.interface';
import { ITokenService } from '../../../../src/domain/interfaces/token-service.interface';
import { IRefreshTokenRepository } from '../../../../src/domain/interfaces/refresh-token-repository.interface';
import { User, UserStatus } from '../../../../src/domain/entities/user.entity';
import { Permission } from '../../../../src/domain/entities/permission.entity';
import { InvalidCredentialsException } from '../../../../src/domain/exceptions/invalid-credentials.exception';
import { UserSuspendedException } from '../../../../src/domain/exceptions/user-suspended.exception';
import * as bcrypt from 'bcrypt';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let permissionRepository: jest.Mocked<IPermissionRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    permissionRepository = {
      findById: jest.fn(),
      findByResourceAndAction: jest.fn(),
      findByRoleId: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    refreshTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      deleteByToken: jest.fn(),
      deleteByUserId: jest.fn(),
    };

    useCase = new LoginUseCase(
      userRepository,
      permissionRepository,
      tokenService,
      refreshTokenRepository,
    );
  });

  it('should login successfully with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = new User(
      'user-1',
      'test@example.com',
      hashedPassword,
      'John',
      'Doe',
      true,
      UserStatus.ACTIVE,
      true,
      null,
      new Date(),
      new Date(),
    );

    const permissions = [
      Permission.create('perm-1', 'product', 'read'),
      Permission.create('perm-2', 'order', 'create'),
    ];

    userRepository.findByEmail.mockResolvedValue(user);
    permissionRepository.findByUserId.mockResolvedValue(permissions);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockResolvedValue('refresh-token');

    const command = new LoginCommand('test@example.com', 'password123');
    const result = await useCase.execute(command);

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.expiresIn).toBe(900);
    expect(refreshTokenRepository.save).toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException for non-existent user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const command = new LoginCommand('wrong@example.com', 'password123');

    await expect(useCase.execute(command)).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException for wrong password', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 12);
    const user = new User(
      'user-1',
      'test@example.com',
      hashedPassword,
      'John',
      'Doe',
      true,
      UserStatus.ACTIVE,
      true,
      null,
      new Date(),
      new Date(),
    );

    userRepository.findByEmail.mockResolvedValue(user);

    const command = new LoginCommand('test@example.com', 'wrongpassword');

    await expect(useCase.execute(command)).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw UserSuspendedException for suspended user', async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = new User(
      'user-1',
      'test@example.com',
      hashedPassword,
      'John',
      'Doe',
      false,
      UserStatus.SUSPENDED,
      true,
      null,
      new Date(),
      new Date(),
    );

    userRepository.findByEmail.mockResolvedValue(user);

    const command = new LoginCommand('test@example.com', 'password123');

    await expect(useCase.execute(command)).rejects.toThrow(UserSuspendedException);
  });
});
