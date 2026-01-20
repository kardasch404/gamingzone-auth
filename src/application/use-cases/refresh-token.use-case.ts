import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IJwtTokenService } from '../ports/jwt-token-service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokenDto } from '../dto/token.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtTokenService: IJwtTokenService,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<TokenDto> {
    let payload: any;
    
    try {
      payload = this.jwtTokenService.verifyRefreshToken(dto.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.refreshTokenRepository.findByToken(dto.refreshToken);
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    const user = await this.userRepository.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newPayload = {
      sub: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(newPayload);
    const refreshToken = this.jwtTokenService.generateRefreshToken({ sub: user.id });

    await this.refreshTokenRepository.delete(storedToken.id);
    
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
