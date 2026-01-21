import { RefreshTokenUseCase } from '../../../../src/application/use-cases/commands/refresh-token.use-case';
import { RefreshTokenCommand } from '../../../../src/application/use-cases/commands/refresh-token.command';
import { IUserRepository } from '../../../../src/domain/interfaces/user-repository.interface';
import { IPermissionRepository } from '../../../../src/domain/interfaces/permission-repository.interface';
import { ITokenService } from '../../../../src/domain/interfaces/token-service.interface';
import { IRefreshTokenRepository } from '../../../../src/domain/interfaces/refresh-token-repository.interface';
import { User, UserStatus } from '../../../../src/domain/entities/user.entity';
import { Permission } from '../../../../src/domain/entities/permission.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
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

    useCase = new RefreshTokenUseCase(
      userRepository,
      permissionRepository,
      tokenService,
      refreshTokenRepository,
    );
  });

  it('should refresh token successfully', async () => {
    const user = User.create('user-1', 'test@example.com', 'hashed', 'John', 'Doe');
    const permissions = [Permission.create('perm-1', 'product', 'read')];
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    refreshTokenRepository.findByToken.mockResolvedValue({ userId: 'user-1', expiresAt });
    userRepository.findById.mockResolvedValue(user);
    permissionRepository.findByUserId.mockResolvedValue(permissions);
    tokenService.generateAccessToken.mockReturnValue('new-access-token');
    tokenService.generateRefreshToken.mockResolvedValue('new-refresh-token');

    const command = new RefreshTokenCommand('old-refresh-token');
    const result = await useCase.execute(command);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith('old-refresh-token');
    expect(refreshTokenRepository.save).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(null);

    const command = new RefreshTokenCommand('invalid-token');

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for expired token', async () => {
    const expiredDate = new Date(Date.now() - 1000);
    refreshTokenRepository.findByToken.mockResolvedValue({ userId: 'user-1', expiresAt: expiredDate });

    const command = new RefreshTokenCommand('expired-token');

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for inactive user', async () => {
    const user = new User(
      'user-1',
      'test@example.com',
      'hashed',
      'John',
      'Doe',
      false,
      UserStatus.SUSPENDED,
      true,
      null,
      new Date(),
      new Date(),
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    refreshTokenRepository.findByToken.mockResolvedValue({ userId: 'user-1', expiresAt });
    userRepository.findById.mockResolvedValue(user);

    const command = new RefreshTokenCommand('valid-token');

    await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException);
  });
});
