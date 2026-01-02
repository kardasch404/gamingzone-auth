import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { RefreshTokenCommand } from '../refresh-token.command';
import { SessionRepository } from '@domain/repositories/session.repository.interface';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { JwtAuthService } from '@infrastructure/auth/jwt.service';

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class RefreshTokenHandler {
  constructor(
    @Inject('SessionRepository')
    private readonly sessionRepository: SessionRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    // 1. Verify refresh token
    const payload = this.jwtAuthService.verifyRefreshToken(command.refreshToken);

    // 2. Find session
    const session = await this.sessionRepository.findByRefreshToken(command.refreshToken);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    // 3. Check expiration
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    // 4. Get user details
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 5. Generate new access token
    const accessToken = this.jwtAuthService.generateAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // 6. Rotate refresh token
    const newRefreshToken = this.jwtAuthService.generateRefreshToken({
      userId: payload.userId,
    });

    await this.sessionRepository.update(session.id, {
      token: accessToken,
      refreshToken: newRefreshToken,
    } as any);

    // 7. Return new tokens
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }
}
