import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userRepository: IUserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'access-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      firstname: payload.firstname,
      lastname: payload.lastname,
    };
  }
}
