import { Injectable } from '@nestjs/common';
import { LoginCommand } from './login.command';
import { AuthResponseDto } from '../../dto/response/auth-response.dto';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { IPermissionRepository } from '../../../domain/interfaces/permission-repository.interface';
import { ITokenService } from '../../../domain/interfaces/token-service.interface';
import { IRefreshTokenRepository } from '../../../domain/interfaces/refresh-token-repository.interface';
import { Password } from '../../../domain/value-objects/password.vo';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { UserSuspendedException } from '../../../domain/exceptions/user-suspended.exception';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await Password.compare(command.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (!user.canLogin()) {
      throw new UserSuspendedException();
    }

    const permissions = await this.permissionRepository.findByUserId(user.id);
    const permissionStrings = permissions.map(p => `${p.resource}:${p.action}`);

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      roles: [],
      permissions: permissionStrings,
    });

    const refreshToken = await this.tokenService.generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.save(user.id, refreshToken, expiresAt);

    user.updateLastLogin();
    await this.userRepository.update(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
