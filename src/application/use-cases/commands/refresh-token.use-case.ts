import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenCommand } from './refresh-token.command';
import { AuthResponseDto } from '../../dto/response/auth-response.dto';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { IPermissionRepository } from '../../../domain/interfaces/permission-repository.interface';
import { ITokenService } from '../../../domain/interfaces/token-service.interface';
import { IRefreshTokenRepository } from '../../../domain/interfaces/refresh-token-repository.interface';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthResponseDto> {
    const tokenData = await this.refreshTokenRepository.findByToken(command.refreshToken);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(tokenData.userId);
    if (!user || !user.canLogin()) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const permissions = await this.permissionRepository.findByUserId(user.id);
    const permissionStrings = permissions.map(p => `${p.resource}:${p.action}`);

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      roles: [],
      permissions: permissionStrings,
    });

    const newRefreshToken = await this.tokenService.generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.deleteByToken(command.refreshToken);
    await this.refreshTokenRepository.save(user.id, newRefreshToken, expiresAt);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }
}
