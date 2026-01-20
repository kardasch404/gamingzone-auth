import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { IJwtTokenService } from '../ports/jwt-token-service.interface';
import { LoginDto } from '../dto/login.dto';
import { TokenDto } from '../dto/token.dto';
import { PasswordHasher } from '../../shared/utils/password-hasher.util';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtTokenService: IJwtTokenService,
  ) {}

  async execute(dto: LoginDto): Promise<TokenDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await PasswordHasher.compare(dto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(payload);
    const refreshToken = this.jwtTokenService.generateRefreshToken({ sub: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
