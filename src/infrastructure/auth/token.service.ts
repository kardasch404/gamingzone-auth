import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenService, JwtPayload } from '../../../domain/interfaces/token-service.interface';
import { generateId } from '../../../shared/utils/uuid.util';

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.accessSecret'),
      expiresIn: '15m',
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = generateId();
    return token;
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.get('jwt.accessSecret'),
    });
  }

  verifyRefreshToken(token: string): { userId: string } {
    return { userId: token };
  }
}
