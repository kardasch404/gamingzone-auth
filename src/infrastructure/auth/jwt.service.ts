import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AccessTokenPayload {
  userId: string;
  email: string;
  roleId: string;
}

interface RefreshTokenPayload {
  userId: string;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessTokenSecret'),
      expiresIn: this.configService.get<string>('jwt.accessTokenExpiry'),
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshTokenSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshTokenExpiry'),
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.refreshTokenSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
