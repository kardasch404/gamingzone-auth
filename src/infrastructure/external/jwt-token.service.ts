import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtTokenService } from '../../application/ports/jwt-token-service.interface';

@Injectable()
export class JwtTokenService implements IJwtTokenService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
  private readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

  constructor(private jwtService: JwtService) {}

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.ACCESS_TOKEN_SECRET,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.REFRESH_TOKEN_SECRET,
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  verifyAccessToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.ACCESS_TOKEN_SECRET,
    });
  }

  verifyRefreshToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.REFRESH_TOKEN_SECRET,
    });
  }
}
